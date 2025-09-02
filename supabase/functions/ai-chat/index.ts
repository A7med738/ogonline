import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ChatBody = {
  prompt: string;
  history?: { role: "user" | "assistant"; content: string }[];
};

async function fetchContext(supabaseClient: any, query: string) {
  const terms = query.trim().split(/\s+/).slice(0, 6).join(" | ");

  const [{ data: news }, { data: stations }, { data: departments }] = await Promise.all([
    supabaseClient.from("news").select("title, summary, content, category, published_at").limit(5).order("published_at", { ascending: false }),
    supabaseClient.from("police_stations").select("name, area, address, description, latitude, longitude").limit(20),
    supabaseClient.from("city_departments").select("title, description, phone, email, hours, latitude, longitude").limit(20),
  ]);

  const contextPieces: string[] = [];
  if (departments?.length) {
    contextPieces.push("[CITY_DEPARTMENTS]\n" + departments.map((d: any) => `- ${d.title}: ${d.description ?? ""} | Phone: ${d.phone} | Email: ${d.email} | Hours: ${d.hours}${d.latitude && d.longitude ? ` | Location: (${d.latitude}, ${d.longitude})` : ""}`).join("\n"));
  }
  if (stations?.length) {
    contextPieces.push("[POLICE_STATIONS]\n" + stations.map((s: any) => `- ${s.name} (${s.area})${s.address ? `, ${s.address}` : ""}${s.description ? ` - ${s.description}` : ""}${s.latitude && s.longitude ? ` | Location: (${s.latitude}, ${s.longitude})` : ""}`).join("\n"));
  }
  if (news?.length) {
    contextPieces.push("[NEWS]\n" + news.map((n: any) => `- ${n.title} [${n.category}] (${n.published_at}): ${n.summary || n.content || ""}`).join("\n"));
  }

  return contextPieces.join("\n\n");
}

async function callGemini(systemPrompt: string, userPrompt: string, history: ChatBody["history"]) {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const contents: any[] = [];
  if (history && history.length) {
    for (const item of history) {
      contents.push({ role: item.role === "user" ? "user" : "model", parts: [{ text: item.content }] });
    }
  }
  contents.push({ role: "user", parts: [{ text: `${systemPrompt}\n\nUser question: ${userPrompt}` }] });

  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Gemini error: ${resp.status} ${text}`);
  }
  const json = await resp.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return text as string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      }
    );

    // Require authenticated user
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = (await req.json()) as ChatBody;
    if (!body?.prompt || typeof body.prompt !== "string") {
      return new Response(JSON.stringify({ error: "Invalid prompt" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const context = await fetchContext(supabaseClient, body.prompt);

    const system = `You are an assistant for October Gardens (حدائق أكتوبر). Answer in Arabic when the question is Arabic, otherwise answer in the user's language.
Use ONLY the following up-to-date context to answer questions. If the information is missing, say you don't know and suggest waiting for updates.
Keep answers concise and actionable. Include phone and email if relevant.

Context:\n${context}`;

    const answer = await callGemini(system, body.prompt, body.history ?? []);

    return new Response(JSON.stringify({ answer }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});


