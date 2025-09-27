import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmbeddingRequest {
  content: string;
  content_type: 'news' | 'police_station' | 'department' | 'emergency_contact';
  content_id: string;
  metadata?: any;
}

async function createEmbedding(text: string): Promise<number[]> {
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = (await req.json()) as EmbeddingRequest;
    
    if (!body?.content || !body?.content_type || !body?.content_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Creating embedding for ${body.content_type} with ID: ${body.content_id}`);

    // Generate embedding
    const embedding = await createEmbedding(body.content);

    // Store in database
    const { data, error } = await supabaseClient
      .from('embeddings')
      .upsert({
        content: body.content,
        content_type: body.content_type,
        content_id: body.content_id,
        embedding: `[${embedding.join(',')}]`,
        metadata: body.metadata || {}
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('Embedding created successfully:', data);

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error('Error in create-embeddings:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});