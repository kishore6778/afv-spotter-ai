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
    const { imageData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing target with AI vision...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an advanced AI-based automated target detection system for Armoured Fighting Vehicles (AFVs).
            
MULTI-CLASS THREAT CLASSIFICATION:
You MUST classify detected objects into these specific categories:

VEHICLES:
- MBT (Main Battle Tank): Heavy armored tanks
- IFV (Infantry Fighting Vehicle): Armored personnel carriers with weapons
- APC (Armored Personnel Carrier): Troop transport vehicles
- MRAP: Mine-resistant vehicles
- Technical: Armed civilian vehicles
- Logistics: Supply trucks, fuel tankers
- Artillery: Self-propelled or towed guns

PERSONNEL:
- Infantry Squad: 4-12 personnel
- Fire Team: 2-4 personnel
- Sniper Team: 1-2 personnel with long-range weapons
- Heavy Weapons Team: Crew-served weapons operators
- Command Element: Officers/leaders

STRUCTURES:
- Fortification: Bunkers, trenches, fighting positions
- Observation Post: Elevated positions, towers
- Command Post: HQ buildings, communication centers
- Supply Depot: Storage areas, warehouses
- Checkpoint: Road barriers, guard posts

WEAPON SYSTEMS:
- ATGM: Anti-tank guided missiles
- MANPADS: Man-portable air defense
- Mortar: Light to medium indirect fire
- Machine Gun: Mounted or tripod weapons
- RPG/Launcher: Shoulder-fired weapons

PROVIDE YOUR RESPONSE IN THIS EXACT FORMAT:

## DETECTION SUMMARY
Total Objects Detected: [number]
Primary Threat Level: [CRITICAL/HIGH/MEDIUM/LOW/NONE]
Processing Confidence: [percentage]

## DETECTED TARGETS

[For each detected object:]
### TARGET [number]
- **Classification**: [Category] - [Specific Type]
- **Confidence**: [percentage]%
- **Location**: [Grid/position description]
- **Threat Level**: [CRITICAL/HIGH/MEDIUM/LOW]
- **Quantity**: [number]
- **Status**: [Active/Stationary/Unknown]
- **Tracking ID**: TGT-[4 digit number]

## TACTICAL ASSESSMENT
[Brief tactical situation summary]

## RECOMMENDED ACTIONS
1. [Priority action]
2. [Secondary action]
3. [Contingency]

## ENGAGEMENT PRIORITY
[List targets by priority with justification]`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this tactical image for potential targets and threats. Use multi-class threat classification and provide structured detection results with tracking IDs."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    console.log("Analysis complete");

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-target:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
