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
    const { frames, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // mode: "detect" for frame-by-frame detection, "report" for final detailed report
    if (mode === "detect") {
      // Single frame analysis for overlay detection
      const frameData = frames[0];
      
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
              content: `You are a military target detection AI analyzing video frames from AFV (Armoured Fighting Vehicle) cameras.

For each frame, detect threats and return ONLY valid JSON (no markdown, no code blocks). Return this exact structure:

{
  "detections": [
    {
      "label": "string - what the threat is (e.g. MBT T-72, Infantry Squad, ATGM Position)",
      "threat_type": "string - category: VEHICLE|PERSONNEL|STRUCTURE|WEAPON_SYSTEM",
      "confidence": number between 0-100,
      "threat_level": "CRITICAL|HIGH|MEDIUM|LOW|NONE",
      "x_percent": number 0-100 horizontal position,
      "y_percent": number 0-100 vertical position,
      "description": "brief tactical description"
    }
  ],
  "scene_summary": "One line summary of the tactical situation"
}

If no threats are detected, return empty detections array. Be realistic - don't fabricate threats that aren't there. Assign confidence levels honestly.`
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Analyze this video frame for military targets and threats. Return JSON only." },
                { type: "image_url", image_url: { url: frameData } }
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
      
      // Clean markdown code blocks if present
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        parsed = { detections: [], scene_summary: "Unable to parse detection results" };
      }

      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    } else if (mode === "report") {
      // Detailed report from multiple frames
      const frameContents = frames.map((frame: string, i: number) => ({
        type: "image_url" as const,
        image_url: { url: frame }
      }));

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
              content: `You are a military intelligence analyst. You have been given key frames extracted from a video captured by an AFV camera system.

Provide a comprehensive tactical analysis report. Return ONLY valid JSON (no markdown, no code blocks):

{
  "report_title": "string - descriptive title for this analysis",
  "overall_threat_level": "CRITICAL|HIGH|MEDIUM|LOW|NONE", 
  "confidence_score": number 0-100,
  "executive_summary": "2-3 sentence overview of the tactical situation",
  "findings": [
    {
      "finding_number": number,
      "title": "string - short title for this finding",
      "description": "string - detailed explanation of what was observed, 2-4 sentences",
      "threat_type": "VEHICLE|PERSONNEL|STRUCTURE|WEAPON_SYSTEM|TERRAIN|MOVEMENT",
      "threat_level": "CRITICAL|HIGH|MEDIUM|LOW|NONE",
      "confidence": number 0-100,
      "frame_index": number - which frame (0-indexed) this finding relates to,
      "tactical_significance": "string - why this matters tactically"
    }
  ],
  "terrain_assessment": "string - description of terrain and how it affects operations",
  "recommended_actions": ["string - action item 1", "string - action item 2"],
  "engagement_priority": [
    {
      "priority": number,
      "target": "string - target description", 
      "justification": "string - why this priority"
    }
  ]
}

Be realistic and honest. Don't overestimate threat levels or fabricate findings. Assign realistic confidence percentages.`
            },
            {
              role: "user",
              content: [
                { type: "text", text: `Analyze these ${frames.length} key frames extracted from a tactical video. Provide a detailed intelligence report. Each finding should reference which frame it was observed in (by frame_index). Return JSON only.` },
                ...frameContents
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
        parsed = { report_title: "Analysis Error", findings: [], executive_summary: "Failed to parse report", overall_threat_level: "NONE", confidence_score: 0, recommended_actions: [], engagement_priority: [], terrain_assessment: "" };
      }

      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid mode. Use 'detect' or 'report'" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Error in analyze-video:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
