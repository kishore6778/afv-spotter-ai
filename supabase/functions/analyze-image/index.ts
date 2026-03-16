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
    const { image, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (mode === "detect") {
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
              content: `You are a military target detection AI analyzing images from surveillance cameras.

Detect threats and return ONLY valid JSON (no markdown, no code blocks):

{
  "detections": [
    {
      "label": "string - what the threat is (e.g. MBT T-72, Infantry Squad, ATGM Position, Artillery Battery)",
      "threat_type": "string - category: VEHICLE|PERSONNEL|STRUCTURE|WEAPON_SYSTEM",
      "confidence": number between 0-100,
      "threat_level": "CRITICAL|HIGH|MEDIUM|LOW|NONE",
      "x_percent": number 0-100 horizontal position in image,
      "y_percent": number 0-100 vertical position in image,
      "description": "brief tactical description of the detected object"
    }
  ],
  "scene_summary": "One line summary of the tactical situation"
}

If no threats are detected, return empty detections array. Be realistic - don't fabricate threats. Assign confidence levels honestly.`
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Analyze this image for military targets and threats. Return JSON only." },
                { type: "image_url", image_url: { url: image } }
              ]
            }
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited. Please wait." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Credits required." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        throw new Error(`AI error: ${response.status}`);
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || "{}";
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        parsed = { detections: [], scene_summary: "Unable to parse detection results" };
      }

      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    } else if (mode === "report") {
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
              content: `You are a military intelligence analyst. Analyze this surveillance image and provide a comprehensive tactical analysis report.

Return ONLY valid JSON (no markdown, no code blocks):

{
  "report_title": "string - descriptive title",
  "overall_threat_level": "CRITICAL|HIGH|MEDIUM|LOW|NONE",
  "confidence_score": number 0-100,
  "executive_summary": "2-3 sentence overview of the tactical situation",
  "findings": [
    {
      "finding_number": number,
      "title": "string - short title",
      "description": "string - detailed explanation, 2-4 sentences",
      "threat_type": "VEHICLE|PERSONNEL|STRUCTURE|WEAPON_SYSTEM|TERRAIN|MOVEMENT",
      "threat_level": "CRITICAL|HIGH|MEDIUM|LOW|NONE",
      "confidence": number 0-100,
      "frame_index": 0,
      "tactical_significance": "string - why this matters tactically"
    }
  ],
  "terrain_assessment": "string - terrain description and operational impact",
  "recommended_actions": ["action 1", "action 2"],
  "engagement_priority": [
    {
      "priority": number,
      "target": "string - target description",
      "justification": "string - why this priority"
    }
  ]
}

Be realistic and honest. Don't overestimate threat levels or fabricate findings.`
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Analyze this surveillance image and provide a detailed intelligence report. Return JSON only." },
                { type: "image_url", image_url: { url: image } }
              ]
            }
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        throw new Error(`AI error: ${response.status}`);
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || "{}";
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        parsed = { report_title: "Analysis Error", findings: [], executive_summary: "Failed to parse report", overall_threat_level: "NONE", confidence_score: 0, recommended_actions: [], engagement_priority: [], terrain_assessment: "" };
      }

      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid mode. Use 'detect' or 'report'" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Error in analyze-image:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
