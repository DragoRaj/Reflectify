
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const STARRY_AI_API_KEY = Deno.env.get("STARRY_AI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, mood } = await req.json();

    // Determine prompt based on mood and content
    let basePrompt = "Create a calming digital artwork";
    
    switch (mood) {
      case 'Happy':
        basePrompt = "Create a bright, joyful digital artwork with warm colors";
        break;
      case 'Calm':
        basePrompt = "Create a serene, peaceful digital artwork with soft blues and greens";
        break;
      case 'Neutral':
        basePrompt = "Create a balanced, harmonious digital artwork with neutral tones";
        break;
      case 'Sad':
        basePrompt = "Create a gentle, comforting digital artwork with soft purples and blues";
        break;
      case 'Angry':
        basePrompt = "Create a transformative digital artwork that channels intense emotions into beauty";
        break;
      case 'Anxious':
        basePrompt = "Create a grounding, reassuring digital artwork with stabilizing patterns";
        break;
    }
    
    // Extract key themes from content if available
    let finalPrompt = basePrompt;
    if (content && content.length > 10) {
      // Extract a simplified version of the content's essence
      finalPrompt = `${basePrompt} that reflects: ${content.slice(0, 100)}`;
    }

    console.log("Generating artwork with prompt:", finalPrompt);

    // Call StarryAI API to generate the artwork
    const response = await fetch("https://api.starryai.com/api/v1/generation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": STARRY_AI_API_KEY || "",
      },
      body: JSON.stringify({
        prompt: finalPrompt,
        height: 512,
        width: 512,
        cfg_scale: 7,
        style_preset: "digital-art",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("StarryAI API error:", errorText);
      throw new Error(`StarryAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    return new Response(JSON.stringify({ 
      imageUrl: data.output?.[0]?.image_url || null,
      prompt: finalPrompt,
      generationId: data.id || null
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in generate-artwork function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
