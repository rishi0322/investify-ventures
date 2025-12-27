import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const prompt = `You are an AI investment advisor for a startup investment platform. 
    
Analyze the following startups and rank them for an investor with these preferences:
- Preferred sectors: ${investorPreferences.sectors?.join(', ') || 'Any'}
- Investment range: ₹${investorPreferences.minInvestment || 500} - ₹${investorPreferences.maxInvestment || 1000000}
- Preferred funding stage: ${investorPreferences.fundingStage || 'Any'}
- Risk tolerance: ${investorPreferences.riskTolerance || 'Medium'}

Startups to analyze:
${startups.map((s: any, i: number) => `
${i + 1}. ${s.name}
   - Sector: ${s.sector}
   - Stage: ${s.funding_stage}
   - Tagline: ${s.tagline}
   - Description: ${s.description}
   - Funding Goal: ₹${s.funding_goal}
   - Amount Raised: ₹${s.amount_raised}
   - Min Investment: ₹${s.min_investment}
`).join('\n')}

For each startup, provide:
1. A match score from 0-100
2. A brief reasoning (2-3 sentences) explaining why this startup matches or doesn't match the investor's profile

Return your response in the following JSON format:
{
  "recommendations": [
    {
      "startup_id": "startup-uuid",
      "startup_name": "Name",
      "match_score": 85,
      "reasoning": "Brief explanation..."
    }
  ]
}

Sort recommendations by match_score in descending order. Only include startups with match_score > 50.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert AI investment advisor. Always respond with valid JSON." },
          { role: "user", content: prompt }
        ],
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
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }
    
    const recommendations = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(recommendations), {
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
