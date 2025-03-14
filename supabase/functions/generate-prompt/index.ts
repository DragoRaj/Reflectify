
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

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
    const { promptType, content } = await req.json();

    let systemPrompt = "";
    if (promptType === "daily") {
      systemPrompt = "Generate a thoughtful, reflective journal prompt that encourages self-reflection and mindfulness. Keep it concise and inspiring.";
    } else if (promptType === "rant-response") {
      systemPrompt = "The user has shared a rant or frustration. Provide a compassionate, understanding response that acknowledges their feelings and offers gentle perspective or encouragement. Be supportive without being dismissive.";
    }

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY || "",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: systemPrompt + (content ? `\n\nUser content: ${content}` : "") }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200,
        },
      }),
    });

    const data = await response.json();
    
    let aiResponse = "";
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      aiResponse = data.candidates[0].content.parts[0].text;
    } else {
      console.error("Unexpected API response format:", data);
      aiResponse = "I couldn't generate a response at the moment. Please try again later.";
    }

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in generate-prompt function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
