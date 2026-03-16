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
    const { chat_id, threat_level, detections, scene_summary, image_base64, source_type } = await req.json();
    
    const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN is not configured");
    }

    const telegramApi = `https://api.telegram.org/bot${BOT_TOKEN}`;

    // Build alert message
    const threatEmoji: Record<string, string> = {
      CRITICAL: '🔴',
      HIGH: '🟠',
      MEDIUM: '🟡',
      LOW: '🟢',
      NONE: '⚪',
    };

    const emoji = threatEmoji[threat_level] || '⚠️';
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    let message = `${emoji} <b>THREAT ALERT — ${threat_level}</b>\n`;
    message += `━━━━━━━━━━━━━━━━━━━\n`;
    message += `📅 <b>Time:</b> ${timestamp}\n`;
    message += `📡 <b>Source:</b> ${source_type === 'image' ? 'Image Analysis' : 'Video Analysis'}\n\n`;

    if (scene_summary) {
      message += `📋 <b>Scene:</b> ${scene_summary}\n\n`;
    }

    if (detections && detections.length > 0) {
      message += `🎯 <b>Detections (${detections.length}):</b>\n`;
      detections.forEach((det: any, i: number) => {
        const detEmoji = threatEmoji[det.threat_level] || '⚠️';
        message += `\n${detEmoji} <b>${i + 1}. ${det.label}</b>\n`;
        message += `   ├ Type: <code>${det.threat_type}</code>\n`;
        message += `   ├ Threat: <b>${det.threat_level}</b>\n`;
        message += `   ├ Confidence: <b>${det.confidence}%</b>\n`;
        message += `   └ ${det.description}\n`;
      });
    }

    message += `\n━━━━━━━━━━━━━━━━━━━\n`;
    message += `🏛 <i>Army Design Bureau — AI Target Detection</i>`;

    // If we have an image, send it as photo with caption
    if (image_base64) {
      // Convert base64 data URL to blob
      const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, '');
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Use multipart form data to send photo
      const formData = new FormData();
      formData.append('chat_id', chat_id);
      // Telegram caption limit is 1024 chars, truncate if needed
      const caption = message.length > 1024 ? message.substring(0, 1020) + '...' : message;
      formData.append('caption', caption);
      formData.append('parse_mode', 'HTML');
      formData.append('photo', new Blob([bytes], { type: 'image/jpeg' }), 'threat.jpg');

      const photoRes = await fetch(`${telegramApi}/sendPhoto`, {
        method: 'POST',
        body: formData,
      });

      if (!photoRes.ok) {
        const errData = await photoRes.json();
        console.error("Photo send failed, falling back to text:", errData);
        
        // Fallback: send text message without photo
        const textRes = await fetch(`${telegramApi}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id,
            text: message,
            parse_mode: 'HTML',
          }),
        });

        const textData = await textRes.json();
        if (!textRes.ok) throw new Error(`Telegram error: ${JSON.stringify(textData)}`);
        return new Response(JSON.stringify({ success: true, method: 'text_fallback' }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const photoData = await photoRes.json();
      return new Response(JSON.stringify({ success: true, method: 'photo', message_id: photoData.result?.message_id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } else {
      // Text only message
      const textRes = await fetch(`${telegramApi}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      const textData = await textRes.json();
      if (!textRes.ok) throw new Error(`Telegram error: ${JSON.stringify(textData)}`);

      return new Response(JSON.stringify({ success: true, method: 'text', message_id: textData.result?.message_id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

  } catch (error) {
    console.error("Error in send-telegram-alert:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
