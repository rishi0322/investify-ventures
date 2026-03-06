import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { investorPreferences, startups } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!startups || startups.length === 0) {
      return new Response(JSON.stringify({ recommendations: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `You are an AI investment advisor for a startup investment platform.
    
Analyze the following startups and rank them for an investor with these preferences:
- Preferred sectors: ${investorPreferences.sectors?.join(', ') || 'Any'}
- Investment range: ₹${investorPreferences.minInvestment || 500} - ₹${investorPreferences.maxInvestment || 1000000}
- Preferred funding stage: ${investorPreferences.fundingStage || 'Any'}
- Risk tolerance: ${investorPreferences.riskTolerance || 'Medium'}

Startups to analyze:
${startups.map((s: any, i: number) => `
${i + 1}. ID: ${s.id}
   Name: ${s.name}
   Sector: ${s.sector}
   Stage: ${s.funding_stage}
   Tagline: ${s.tagline}
   Description: ${s.description}
   Funding Goal: ₹${s.funding_goal}
   Amount Raised: ₹${s.amount_raised}
   Min Investment: ₹${s.min_investment}
`).join('\n')}

Rank the startups by match score (0-100) based on how well they align with the investor's preferences. Provide reasoning for each. Only include startups with score > 40. Sort by score descending.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert AI investment advisor. Use the provided tool to return structured recommendations." },
          { role: "user", content: prompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_recommendations",
              description: "Return ranked startup recommendations for the investor.",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        startup_id: { type: "string", description: "The UUID of the startup" },
                        startup_name: { type: "string", description: "Name of the startup" },
                        match_score: { type: "number", description: "Match score 0-100" },
                        reasoning: { type: "string", description: "2-3 sentence explanation of why this startup matches" }
                      },
                      required: ["startup_id", "startup_name", "match_score", "reasoning"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["recommendations"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "return_recommendations" } },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analysis failed. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    
    // Extract from tool call response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let recommendations;
    
    if (toolCall?.function?.arguments) {
      const args = typeof toolCall.function.arguments === 'string' 
        ? JSON.parse(toolCall.function.arguments) 
        : toolCall.function.arguments;
      recommendations = args.recommendations || [];
    } else {
      // Fallback: try parsing content directly
      const content = data.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]).recommendations || [];
      } else {
        recommendations = [];
      }
    }

    // Sort by match_score descending
    recommendations.sort((a: any, b: any) => b.match_score - a.match_score);

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error("AI matching error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
