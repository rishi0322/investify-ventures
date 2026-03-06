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
    const { startup } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `Analyze this startup and provide actionable insights:

Startup: ${startup.name}
Sector: ${startup.sectorLabel}
Stage: ${startup.fundingStageLabel}
Tagline: ${startup.tagline}
Description: ${startup.description}
Funding Goal: ₹${startup.fundingGoal}
Amount Raised: ₹${startup.amountRaised} (${startup.fundingProgress.toFixed(1)}% funded)
Valuation: ₹${startup.valuation}
Min Investment: ₹${startup.minInvestment}
Team Size: ${startup.teamSize || 'Not specified'}
Location: ${startup.location || 'Not specified'}
Founded: ${startup.foundedYear || 'Not specified'}
Investors: ${startup.investorCount}
Total Investments: ${startup.investmentCount}
Avg Investment: ₹${Math.round(startup.avgInvestment)}
Has Website: ${startup.hasWebsite}
Has Pitch Deck: ${startup.hasPitchDeck}
Has Pitch Video: ${startup.hasPitchVideo}

Provide exactly 6 insights across these categories: strength, improvement, opportunity, risk.
Include at least 1 of each category. Be specific to this startup's sector and data.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a startup advisor AI. Use the provided tool to return structured analysis." },
          { role: "user", content: prompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_analysis",
              description: "Return structured startup analysis with score, summary, and insights.",
              parameters: {
                type: "object",
                properties: {
                  overallScore: { type: "number", description: "Startup health score 0-100 based on completeness, traction, and potential" },
                  summary: { type: "string", description: "2-3 sentence overall assessment of the startup" },
                  insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string", enum: ["strength", "improvement", "opportunity", "risk"] },
                        title: { type: "string", description: "Short insight title (3-6 words)" },
                        description: { type: "string", description: "1-2 sentence explanation" },
                        actionable: { type: "string", description: "Specific action the founder should take" }
                      },
                      required: ["category", "title", "description", "actionable"],
                      additionalProperties: false
                    }
                  },
                  competitorBenchmark: { type: "string", description: "1 sentence about market position vs competitors in the sector" },
                  growthPrediction: { type: "string", description: "1 sentence growth outlook prediction" }
                },
                required: ["overallScore", "summary", "insights", "competitorBenchmark", "growthPrediction"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "return_analysis" } },
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
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    let analysis;
    if (toolCall?.function?.arguments) {
      analysis = typeof toolCall.function.arguments === 'string'
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    } else {
      const content = data.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response");
      }
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error("AI insights error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
