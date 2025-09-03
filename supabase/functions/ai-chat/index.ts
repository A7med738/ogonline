import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ChatBody = {
  prompt: string;
  history?: { role: "user" | "assistant"; content: string }[];
};

async function createQueryEmbedding(text: string): Promise<number[]> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not found');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

async function fetchContext(supabaseClient: any, query: string) {
  console.log('Fetching context for query:', query);
  
  try {
    // Generate embedding for the query
    const queryEmbedding = await createQueryEmbedding(query);
    console.log('Query embedding generated successfully');

    // Search for similar content using vector similarity
    const { data: similarContent } = await supabaseClient.rpc('match_embeddings', {
      query_embedding: `[${queryEmbedding.join(',')}]`,
      match_threshold: 0.7,
      match_count: 10
    });

    console.log('Similar content found:', similarContent?.length || 0, 'items');

    // Fallback to traditional queries if no similar content found
    const [{ data: news }, { data: stations }, { data: departments }, { data: emergencyContacts }] = await Promise.all([
      supabaseClient.from("news").select("title, summary, content, category, published_at").limit(8).order("published_at", { ascending: false }),
      supabaseClient.from("police_stations").select("name, area, address, description, latitude, longitude").limit(15),
      supabaseClient.from("city_departments").select("title, description, phone, email, hours, latitude, longitude").limit(15),
      supabaseClient.from("emergency_contacts").select("title, description, number, type").limit(10),
    ]);

    const contextPieces: string[] = [];

    // Add similar content first if available
    if (similarContent?.length) {
      const relevantContent = similarContent.map((item: any) => `[${item.content_type.toUpperCase()}] ${item.content}`).join('\n');
      contextPieces.push("[RELEVANT_CONTENT]\n" + relevantContent);
    }

    // Add structured data
    if (departments?.length) {
      contextPieces.push("[CITY_DEPARTMENTS]\n" + departments.map((d: any) => 
        `- ${d.title}: ${d.description ?? ""} | Phone: ${d.phone} | Email: ${d.email} | Hours: ${d.hours}${d.latitude && d.longitude ? ` | Location: (${d.latitude}, ${d.longitude})` : ""}`
      ).join("\n"));
    }
    
    if (stations?.length) {
      contextPieces.push("[POLICE_STATIONS]\n" + stations.map((s: any) => 
        `- ${s.name} (${s.area})${s.address ? `, ${s.address}` : ""}${s.description ? ` - ${s.description}` : ""}${s.latitude && s.longitude ? ` | Location: (${s.latitude}, ${s.longitude})` : ""}`
      ).join("\n"));
    }
    
    if (emergencyContacts?.length) {
      contextPieces.push("[EMERGENCY_CONTACTS]\n" + emergencyContacts.map((e: any) => 
        `- ${e.title} (${e.type}): ${e.number}${e.description ? ` - ${e.description}` : ""}`
      ).join("\n"));
    }
    
    if (news?.length) {
      contextPieces.push("[NEWS]\n" + news.map((n: any) => 
        `- ${n.title} [${n.category}] (${n.published_at}): ${n.summary || n.content || ""}`
      ).join("\n"));
    }

    const context = contextPieces.join("\n\n");
    console.log('Context generated, length:', context.length);
    return context;

  } catch (error) {
    console.error('Error in fetchContext:', error);
    // Fallback to basic context if embedding fails
    const [{ data: news }, { data: stations }, { data: departments }] = await Promise.all([
      supabaseClient.from("news").select("title, summary, content, category, published_at").limit(5).order("published_at", { ascending: false }),
      supabaseClient.from("police_stations").select("name, area, address, description, latitude, longitude").limit(10),
      supabaseClient.from("city_departments").select("title, description, phone, email, hours, latitude, longitude").limit(10),
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

  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    console.error('Gemini API error:', text);
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


