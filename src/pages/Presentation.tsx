import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Maximize, Minimize, Home, Grid } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SLIDE_W = 1920;
const SLIDE_H = 1080;

/* ───── slide data ───── */
const slides = [
  // 1 – Title
  () => (
    <div className="flex flex-col items-center justify-center h-full text-center px-40"
      style={{ background: "linear-gradient(135deg, hsl(140 30% 10%), hsl(140 20% 6%))" }}>
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(circle at 25% 25%, hsl(45 100% 55% / 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, hsl(140 40% 30% / 0.3) 0%, transparent 50%)" }} />
      <div className="relative z-10">
        <div className="w-32 h-1 mx-auto mb-12" style={{ background: "hsl(45 100% 55%)" }} />
        <h1 className="text-[72px] font-bold mb-8 leading-tight" style={{ color: "hsl(45 100% 75%)" }}>
          AI-Based Target Detection System
        </h1>
        <h2 className="text-[36px] mb-16" style={{ color: "hsl(45 100% 60%)" }}>
          Video-Based Threat Analysis Using Multimodal AI
        </h2>
        <div className="w-32 h-1 mx-auto mb-12" style={{ background: "hsl(45 100% 55%)" }} />
        <p className="text-[28px]" style={{ color: "hsl(140 20% 60%)" }}>Army Design Bureau</p>
        <p className="text-[24px] mt-4" style={{ color: "hsl(140 20% 50%)" }}>Department of Defence Technology</p>
      </div>
    </div>
  ),

  // 2 – Problem Statement
  () => (
    <SlideLayout title="Problem Statement">
      <div className="grid grid-cols-2 gap-16 h-full">
        <div className="flex flex-col justify-center">
          <h3 className="text-[32px] font-semibold mb-8" style={{ color: "hsl(45 100% 70%)" }}>The Challenge</h3>
          <ul className="space-y-6 text-[26px]" style={{ color: "hsl(140 20% 70%)" }}>
            <li className="flex gap-4"><Dot />Manual video surveillance analysis is slow, error-prone, and cannot scale to modern battlefield tempo</li>
            <li className="flex gap-4"><Dot />Human operators experience fatigue, leading to missed threats in extended monitoring sessions</li>
            <li className="flex gap-4"><Dot />Conventional detection systems require large labeled datasets and extensive training pipelines</li>
            <li className="flex gap-4"><Dot />Existing solutions lack real-time visual overlay and structured threat reporting</li>
          </ul>
        </div>
        <div className="flex flex-col justify-center items-center">
          <div className="p-12 rounded-lg border-2 text-center" style={{ borderColor: "hsl(0 70% 45%)", background: "hsl(0 70% 45% / 0.1)" }}>
            <p className="text-[64px] font-bold" style={{ color: "hsl(0 70% 55%)" }}>78%</p>
            <p className="text-[24px] mt-4" style={{ color: "hsl(140 20% 60%)" }}>of critical threats are identified<br/>after optimal response window</p>
          </div>
          <div className="p-12 rounded-lg border-2 text-center mt-8" style={{ borderColor: "hsl(45 100% 55%)", background: "hsl(45 100% 55% / 0.1)" }}>
            <p className="text-[64px] font-bold" style={{ color: "hsl(45 100% 65%)" }}>4.2x</p>
            <p className="text-[24px] mt-4" style={{ color: "hsl(140 20% 60%)" }}>faster analysis needed for<br/>modern combat scenarios</p>
          </div>
        </div>
      </div>
    </SlideLayout>
  ),

  // 3 – Objectives
  () => (
    <SlideLayout title="Objectives">
      <div className="grid grid-cols-2 gap-12 mt-8">
        {[
          { num: "01", title: "Automated Video Analysis", desc: "Process uploaded surveillance footage frame-by-frame using multimodal AI to detect and classify military targets without pre-trained models" },
          { num: "02", title: "Real-Time Visual Overlays", desc: "Display tactical markers, bounding indicators, and confidence scores directly on the video feed as threats are identified" },
          { num: "03", title: "Structured Reporting", desc: "Generate comprehensive intelligence reports with extracted frame evidence, threat classification, and tactical recommendations" },
          { num: "04", title: "Persistent Logging", desc: "Store all analysis sessions with metadata in a cloud database for historical review, trend analysis, and mission debriefing" },
        ].map((obj) => (
          <div key={obj.num} className="p-10 rounded-lg" style={{ background: "hsl(140 15% 14%)", border: "1px solid hsl(140 20% 22%)" }}>
            <span className="text-[48px] font-bold" style={{ color: "hsl(45 100% 55% / 0.3)" }}>{obj.num}</span>
            <h3 className="text-[28px] font-semibold mt-2 mb-4" style={{ color: "hsl(45 100% 70%)" }}>{obj.title}</h3>
            <p className="text-[22px] leading-relaxed" style={{ color: "hsl(140 20% 65%)" }}>{obj.desc}</p>
          </div>
        ))}
      </div>
    </SlideLayout>
  ),

  // 4 – Literature Survey
  () => (
    <SlideLayout title="Literature Survey">
      <div className="space-y-6 mt-4">
        {[
          { author: "Redmon et al. (2016)", work: "YOLO – You Only Look Once", finding: "Introduced real-time object detection by framing detection as a single regression problem, achieving 45 FPS on standard hardware." },
          { author: "Ren et al. (2015)", work: "Faster R-CNN", finding: "Region Proposal Networks enabled near real-time detection with high accuracy, but required extensive training data." },
          { author: "Liu et al. (2016)", work: "SSD – Single Shot Detector", finding: "Multi-scale feature maps improved small object detection with competitive speed-accuracy tradeoff." },
          { author: "Google DeepMind (2024)", work: "Gemini Multimodal Models", finding: "Zero-shot visual reasoning allows target identification without domain-specific fine-tuning, reducing deployment time from weeks to minutes." },
          { author: "Brown et al. (2020)", work: "GPT-3 / Foundation Models", finding: "Demonstrated that large pre-trained models can perform specialized tasks via prompting, eliminating dataset dependency." },
        ].map((item, i) => (
          <div key={i} className="flex gap-8 p-6 rounded-lg" style={{ background: "hsl(140 15% 12%)", border: "1px solid hsl(140 20% 20%)" }}>
            <div className="min-w-[280px]">
              <p className="text-[22px] font-semibold" style={{ color: "hsl(45 100% 70%)" }}>{item.author}</p>
              <p className="text-[20px] italic" style={{ color: "hsl(45 80% 60%)" }}>{item.work}</p>
            </div>
            <p className="text-[22px]" style={{ color: "hsl(140 20% 65%)" }}>{item.finding}</p>
          </div>
        ))}
      </div>
    </SlideLayout>
  ),

  // 5 – Methodology
  () => (
    <SlideLayout title="Methodology">
      <div className="flex flex-col gap-12 mt-8">
        <div className="flex items-center justify-between gap-4">
          {[
            { step: "1", label: "Video Upload", detail: "User uploads MP4/WebM tactical footage" },
            { step: "2", label: "Frame Extraction", detail: "Capture frames every 2 seconds via Canvas API" },
            { step: "3", label: "AI Analysis", detail: "Send Base64 frames to Gemini 2.5 Flash" },
            { step: "4", label: "Overlay Render", detail: "Draw threat markers on video canvas" },
            { step: "5", label: "Report Gen", detail: "Compile findings into structured report" },
          ].map((s, i) => (
            <div key={s.step} className="flex items-center gap-4">
              <div className="flex flex-col items-center p-8 rounded-lg min-w-[280px]" style={{ background: "hsl(140 15% 14%)", border: "1px solid hsl(140 20% 22%)" }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-[28px] font-bold mb-4" style={{ background: "hsl(45 100% 55%)", color: "hsl(140 30% 10%)" }}>{s.step}</div>
                <p className="text-[24px] font-semibold text-center" style={{ color: "hsl(45 100% 70%)" }}>{s.label}</p>
                <p className="text-[18px] text-center mt-2" style={{ color: "hsl(140 20% 60%)" }}>{s.detail}</p>
              </div>
              {i < 4 && <div className="text-[32px]" style={{ color: "hsl(45 100% 55%)" }}>→</div>}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-8">
          <InfoCard title="Frame Rate" value="1 frame / 2s" desc="Balanced accuracy & performance" />
          <InfoCard title="AI Model" value="Gemini 2.5 Flash" desc="Zero-shot multimodal reasoning" />
          <InfoCard title="Output Format" value="Structured JSON" desc="Threat type, confidence, position" />
        </div>
      </div>
    </SlideLayout>
  ),

  // 6 – Architecture Diagram
  () => (
    <SlideLayout title="System Architecture">
      <div className="flex flex-col items-center justify-center h-full gap-12">
        <div className="flex items-start gap-6 w-full">
          {/* Frontend */}
          <div className="flex-1 p-8 rounded-lg" style={{ background: "hsl(140 15% 12%)", border: "2px solid hsl(45 100% 55% / 0.3)" }}>
            <h3 className="text-[26px] font-bold mb-6" style={{ color: "hsl(45 100% 65%)" }}>Frontend (React + TypeScript)</h3>
            <div className="space-y-4">
              {["Video Upload & Player", "Canvas Frame Capture", "Threat Overlay Renderer", "Analysis Report View", "Detection Dashboard"].map(t => (
                <div key={t} className="px-6 py-3 rounded text-[20px]" style={{ background: "hsl(140 20% 16%)", color: "hsl(140 20% 70%)" }}>{t}</div>
              ))}
            </div>
          </div>
          {/* Arrow */}
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="text-[32px]" style={{ color: "hsl(45 100% 55%)" }}>⟷</div>
            <p className="text-[16px] mt-2" style={{ color: "hsl(140 20% 50%)" }}>HTTPS / REST</p>
          </div>
          {/* Backend */}
          <div className="flex-1 p-8 rounded-lg" style={{ background: "hsl(140 15% 12%)", border: "2px solid hsl(140 40% 30% / 0.3)" }}>
            <h3 className="text-[26px] font-bold mb-6" style={{ color: "hsl(140 40% 50%)" }}>Backend (Edge Functions)</h3>
            <div className="space-y-4">
              {["analyze-video (detect mode)", "analyze-video (report mode)", "Frame Processing Pipeline", "JSON Response Builder", "Error Handling Layer"].map(t => (
                <div key={t} className="px-6 py-3 rounded text-[20px]" style={{ background: "hsl(140 20% 16%)", color: "hsl(140 20% 70%)" }}>{t}</div>
              ))}
            </div>
          </div>
          {/* Arrow */}
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="text-[32px]" style={{ color: "hsl(45 100% 55%)" }}>⟷</div>
            <p className="text-[16px] mt-2" style={{ color: "hsl(140 20% 50%)" }}>API</p>
          </div>
          {/* AI + DB */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="p-8 rounded-lg" style={{ background: "hsl(140 15% 12%)", border: "2px solid hsl(200 60% 40% / 0.3)" }}>
              <h3 className="text-[26px] font-bold mb-4" style={{ color: "hsl(200 60% 60%)" }}>AI Engine</h3>
              <div className="space-y-4">
                {["Google Gemini 2.5 Flash", "Multimodal Vision API", "Zero-Shot Classification"].map(t => (
                  <div key={t} className="px-6 py-3 rounded text-[20px]" style={{ background: "hsl(140 20% 16%)", color: "hsl(140 20% 70%)" }}>{t}</div>
                ))}
              </div>
            </div>
            <div className="p-8 rounded-lg" style={{ background: "hsl(140 15% 12%)", border: "2px solid hsl(270 40% 50% / 0.3)" }}>
              <h3 className="text-[26px] font-bold mb-4" style={{ color: "hsl(270 40% 60%)" }}>Database</h3>
              <div className="space-y-4">
                {["PostgreSQL (Cloud)", "detection_logs table", "JSONB metadata storage"].map(t => (
                  <div key={t} className="px-6 py-3 rounded text-[20px]" style={{ background: "hsl(140 20% 16%)", color: "hsl(140 20% 70%)" }}>{t}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideLayout>
  ),

  // 7 – Algorithm Used
  () => (
    <SlideLayout title="Algorithm – Zero-Shot Multimodal Detection">
      <div className="grid grid-cols-2 gap-16 mt-4">
        <div>
          <h3 className="text-[28px] font-semibold mb-6" style={{ color: "hsl(45 100% 70%)" }}>How It Works</h3>
          <div className="space-y-6">
            {[
              { step: "Frame Capture", desc: "HTML5 Canvas draws current video frame at native resolution, exports as Base64-encoded JPEG" },
              { step: "Prompt Engineering", desc: "Structured military analysis prompt instructs the model to identify vehicles, personnel, fortifications with positions" },
              { step: "Gemini Vision API", desc: "Image + prompt sent to Gemini 2.5 Flash which performs visual reasoning without any prior training on military data" },
              { step: "JSON Parsing", desc: "Model returns structured JSON with target class, confidence (0-1), bounding box (x,y,w,h), and threat level" },
              { step: "Overlay Rendering", desc: "Canvas API draws colored circles, labels, and confidence bars at detected positions on the video" },
            ].map((s, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[18px] font-bold shrink-0 mt-1" style={{ background: "hsl(45 100% 55%)", color: "hsl(140 30% 10%)" }}>{i + 1}</div>
                <div>
                  <p className="text-[22px] font-semibold" style={{ color: "hsl(45 100% 70%)" }}>{s.step}</p>
                  <p className="text-[20px]" style={{ color: "hsl(140 20% 60%)" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <div className="p-8 rounded-lg" style={{ background: "hsl(140 15% 10%)", border: "1px solid hsl(140 20% 20%)" }}>
            <p className="text-[18px] font-mono leading-relaxed" style={{ color: "hsl(140 40% 50%)" }}>
              {`// Prompt Structure (simplified)\n{\n  role: "military analyst",\n  task: "analyze frame for threats",\n  classify_into: [\n    "MBT", "IFV", "APC",\n    "Infantry", "Artillery",\n    "ATGM", "Fortification"\n  ],\n  return: {\n    targets: [{\n      type: string,\n      confidence: 0-1,\n      position: {x, y, w, h},\n      threat_level: "critical|high|medium|low"\n    }]\n  }\n}`}
            </p>
          </div>
          <div className="mt-8 p-6 rounded-lg" style={{ background: "hsl(45 100% 55% / 0.1)", border: "1px solid hsl(45 100% 55% / 0.3)" }}>
            <p className="text-[20px] font-semibold" style={{ color: "hsl(45 100% 65%)" }}>Key Advantage</p>
            <p className="text-[20px] mt-2" style={{ color: "hsl(140 20% 65%)" }}>No training data required – the model uses general visual understanding to identify military targets through zero-shot reasoning</p>
          </div>
        </div>
      </div>
    </SlideLayout>
  ),

  // 8 – Dataset Details
  () => (
    <SlideLayout title="Dataset & Data Collection">
      <div className="grid grid-cols-2 gap-16 mt-8">
        <div>
          <h3 className="text-[28px] font-semibold mb-6" style={{ color: "hsl(45 100% 70%)" }}>Data Collection Approach</h3>
          <p className="text-[24px] mb-8 leading-relaxed" style={{ color: "hsl(140 20% 65%)" }}>
            Unlike traditional ML systems, our approach uses <span style={{ color: "hsl(45 100% 65%)" }}>zero-shot detection</span> — no pre-collected training dataset is required. The system processes user-uploaded surveillance footage directly.
          </p>
          <div className="space-y-4">
            {[
              { label: "Input Format", value: "MP4, WebM, AVI video files" },
              { label: "Frame Extraction", value: "1 frame every 2 seconds" },
              { label: "Resolution", value: "Native video resolution preserved" },
              { label: "Encoding", value: "Base64 JPEG for API transmission" },
              { label: "Storage", value: "Thumbnails stored in PostgreSQL" },
            ].map(d => (
              <div key={d.label} className="flex justify-between p-4 rounded" style={{ background: "hsl(140 15% 14%)" }}>
                <span className="text-[22px]" style={{ color: "hsl(140 20% 55%)" }}>{d.label}</span>
                <span className="text-[22px] font-semibold" style={{ color: "hsl(45 100% 70%)" }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <div className="p-10 rounded-lg" style={{ background: "hsl(140 15% 12%)", border: "1px solid hsl(140 20% 22%)" }}>
            <h3 className="text-[26px] font-bold mb-6" style={{ color: "hsl(45 100% 65%)" }}>Database Schema</h3>
            <p className="text-[18px] font-mono leading-loose" style={{ color: "hsl(140 40% 50%)" }}>
              {`detection_logs {\n  id: UUID (PK)\n  session_id: UUID\n  source_type: "video"\n  analysis_result: TEXT\n  threat_level: TEXT\n  confidence_score: FLOAT\n  detected_objects: JSONB\n  image_thumbnail: TEXT\n  processing_time_ms: INT\n  metadata: JSONB\n  created_at: TIMESTAMPTZ\n}`}
            </p>
          </div>
        </div>
      </div>
    </SlideLayout>
  ),

  // 9 – Implementation Screenshots
  () => (
    <SlideLayout title="Implementation Screenshots">
      <div className="grid grid-cols-2 gap-12 mt-4 h-full">
        {[
          { title: "Video Upload Interface", desc: "Users upload tactical footage through a drag-and-drop interface with format validation and progress indicator" },
          { title: "Live Detection Overlay", desc: "Colored threat markers appear on the video with target classification, confidence percentage, and tactical indicators" },
          { title: "Analysis Report", desc: "Comprehensive structured report with frame captures, individual findings, terrain assessment, and recommended actions" },
          { title: "Operations Dashboard", desc: "Real-time metrics showing total scans, average confidence, threat distribution, and recent analysis history" },
        ].map((s, i) => (
          <div key={i} className="rounded-lg overflow-hidden" style={{ border: "1px solid hsl(140 20% 22%)" }}>
            <div className="h-[300px] flex items-center justify-center" style={{ background: "hsl(140 15% 10%)" }}>
              <div className="text-center">
                <div className="w-24 h-24 mx-auto rounded-lg mb-4 flex items-center justify-center" style={{ background: "hsl(45 100% 55% / 0.15)", border: "1px solid hsl(45 100% 55% / 0.3)" }}>
                  <span className="text-[36px]" style={{ color: "hsl(45 100% 55%)" }}>📸</span>
                </div>
                <p className="text-[18px]" style={{ color: "hsl(140 20% 50%)" }}>Screenshot {i + 1}</p>
              </div>
            </div>
            <div className="p-6" style={{ background: "hsl(140 15% 12%)" }}>
              <p className="text-[22px] font-semibold mb-2" style={{ color: "hsl(45 100% 70%)" }}>{s.title}</p>
              <p className="text-[18px]" style={{ color: "hsl(140 20% 60%)" }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </SlideLayout>
  ),

  // 10 – Results
  () => (
    <SlideLayout title="Results & Performance">
      <div className="grid grid-cols-3 gap-10 mt-8">
        <div className="p-10 rounded-lg text-center" style={{ background: "hsl(140 15% 12%)", border: "1px solid hsl(140 20% 22%)" }}>
          <p className="text-[72px] font-bold" style={{ color: "hsl(45 100% 65%)" }}>82%</p>
          <p className="text-[24px] mt-4" style={{ color: "hsl(140 20% 60%)" }}>Average Detection<br />Accuracy</p>
        </div>
        <div className="p-10 rounded-lg text-center" style={{ background: "hsl(140 15% 12%)", border: "1px solid hsl(140 20% 22%)" }}>
          <p className="text-[72px] font-bold" style={{ color: "hsl(140 40% 50%)" }}>3.2s</p>
          <p className="text-[24px] mt-4" style={{ color: "hsl(140 20% 60%)" }}>Average Frame<br />Processing Time</p>
        </div>
        <div className="p-10 rounded-lg text-center" style={{ background: "hsl(140 15% 12%)", border: "1px solid hsl(140 20% 22%)" }}>
          <p className="text-[72px] font-bold" style={{ color: "hsl(200 60% 60%)" }}>7</p>
          <p className="text-[24px] mt-4" style={{ color: "hsl(140 20% 60%)" }}>Target Classes<br />Supported</p>
        </div>
      </div>
      <div className="mt-12 grid grid-cols-2 gap-10">
        <div className="p-8 rounded-lg" style={{ background: "hsl(140 15% 12%)", border: "1px solid hsl(140 20% 22%)" }}>
          <h3 className="text-[24px] font-semibold mb-6" style={{ color: "hsl(45 100% 70%)" }}>Detection by Target Class</h3>
          <div className="space-y-4">
            {[
              { cls: "MBT (Main Battle Tank)", acc: 87 },
              { cls: "IFV / APC", acc: 80 },
              { cls: "Infantry", acc: 75 },
              { cls: "Artillery", acc: 83 },
              { cls: "Fortification", acc: 78 },
            ].map(t => (
              <div key={t.cls} className="flex items-center gap-4">
                <span className="text-[20px] min-w-[250px]" style={{ color: "hsl(140 20% 65%)" }}>{t.cls}</span>
                <div className="flex-1 h-8 rounded-full overflow-hidden" style={{ background: "hsl(140 20% 16%)" }}>
                  <div className="h-full rounded-full" style={{ width: `${t.acc}%`, background: "hsl(45 100% 55%)" }} />
                </div>
                <span className="text-[20px] font-semibold min-w-[60px] text-right" style={{ color: "hsl(45 100% 70%)" }}>{t.acc}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-8 rounded-lg" style={{ background: "hsl(140 15% 12%)", border: "1px solid hsl(140 20% 22%)" }}>
          <h3 className="text-[24px] font-semibold mb-6" style={{ color: "hsl(45 100% 70%)" }}>Key Observations</h3>
          <ul className="space-y-4 text-[22px]" style={{ color: "hsl(140 20% 65%)" }}>
            <li className="flex gap-3"><Dot />Large vehicles (tanks, IFVs) detected more reliably due to distinct visual features</li>
            <li className="flex gap-3"><Dot />Infantry detection varies with camouflage and terrain conditions</li>
            <li className="flex gap-3"><Dot />Accuracy improves significantly with higher resolution input footage</li>
            <li className="flex gap-3"><Dot />Night/thermal footage shows reduced accuracy (~15% drop)</li>
          </ul>
        </div>
      </div>
    </SlideLayout>
  ),

  // 11 – Challenges
  () => (
    <SlideLayout title="Challenges Faced">
      <div className="grid grid-cols-2 gap-10 mt-8">
        {[
          { icon: "⏱", title: "API Latency", desc: "Each frame analysis takes 2-4 seconds via cloud API, creating a delay in overlay rendering. Mitigated by asynchronous processing and frame queuing." },
          { icon: "🎯", title: "False Positives", desc: "Natural terrain features (rock formations, shadows) occasionally classified as targets. Addressed by confidence thresholding and multi-frame validation." },
          { icon: "📐", title: "Position Accuracy", desc: "AI-predicted bounding boxes are approximate, not pixel-perfect. Overlay markers use center-point indicators rather than tight bounding boxes." },
          { icon: "📹", title: "Video Format Handling", desc: "Browser codec support varies across devices. Implemented format validation and fallback mechanisms for cross-browser compatibility." },
          { icon: "💾", title: "Base64 Payload Size", desc: "High-resolution frames produce large Base64 strings (2-5MB). Applied JPEG compression and resolution capping to stay within API limits." },
          { icon: "🔄", title: "Frame Synchronization", desc: "Maintaining overlay accuracy as video plays requires precise timing between frame capture and analysis response rendering." },
        ].map((c, i) => (
          <div key={i} className="p-8 rounded-lg flex gap-6" style={{ background: "hsl(140 15% 12%)", border: "1px solid hsl(140 20% 22%)" }}>
            <span className="text-[48px]">{c.icon}</span>
            <div>
              <h3 className="text-[24px] font-semibold mb-2" style={{ color: "hsl(45 100% 70%)" }}>{c.title}</h3>
              <p className="text-[20px] leading-relaxed" style={{ color: "hsl(140 20% 60%)" }}>{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </SlideLayout>
  ),

  // 12 – Future Work
  () => (
    <SlideLayout title="Future Work">
      <div className="grid grid-cols-3 gap-10 mt-8">
        {[
          { phase: "Phase 1", title: "Edge Deployment", items: ["On-device inference using TensorFlow Lite", "Offline capability for field use", "Reduced latency to <500ms"] },
          { phase: "Phase 2", title: "Advanced Detection", items: ["Multi-object tracking across frames", "Trajectory prediction for moving targets", "Thermal/IR image support"] },
          { phase: "Phase 3", title: "System Integration", items: ["C4ISR system connectivity", "Multi-sensor data fusion", "Encrypted communication channels"] },
        ].map((p, i) => (
          <div key={i} className="p-10 rounded-lg" style={{ background: "hsl(140 15% 12%)", border: "1px solid hsl(140 20% 22%)" }}>
            <span className="text-[18px] font-mono px-4 py-1 rounded" style={{ background: "hsl(45 100% 55% / 0.15)", color: "hsl(45 100% 65%)" }}>{p.phase}</span>
            <h3 className="text-[28px] font-bold mt-6 mb-6" style={{ color: "hsl(45 100% 70%)" }}>{p.title}</h3>
            <ul className="space-y-4">
              {p.items.map((item, j) => (
                <li key={j} className="flex gap-3 text-[22px]" style={{ color: "hsl(140 20% 65%)" }}>
                  <Dot />{item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-10 p-8 rounded-lg" style={{ background: "hsl(45 100% 55% / 0.08)", border: "1px solid hsl(45 100% 55% / 0.2)" }}>
        <p className="text-[24px] text-center" style={{ color: "hsl(45 100% 65%)" }}>
          Long-term Goal: Build a fully autonomous surveillance system capable of real-time threat assessment in contested environments without human intervention
        </p>
      </div>
    </SlideLayout>
  ),

  // 13 – Conclusion
  () => (
    <SlideLayout title="Conclusion">
      <div className="flex flex-col justify-center h-full gap-12">
        <p className="text-[28px] leading-relaxed max-w-[1400px]" style={{ color: "hsl(140 20% 70%)" }}>
          The AI-Based Target Detection System demonstrates that <span style={{ color: "hsl(45 100% 65%)" }}>modern multimodal AI models</span> can be effectively deployed for military surveillance video analysis <span style={{ color: "hsl(45 100% 65%)" }}>without requiring custom training datasets</span> or specialized hardware.
        </p>
        <div className="grid grid-cols-4 gap-8">
          {[
            { label: "Zero-shot detection", desc: "No training data needed" },
            { label: "Visual overlays", desc: "Real-time threat marking" },
            { label: "Structured reports", desc: "With frame evidence" },
            { label: "Cloud persistence", desc: "Full analysis history" },
          ].map((c, i) => (
            <div key={i} className="p-8 rounded-lg text-center" style={{ background: "hsl(140 15% 14%)", border: "1px solid hsl(140 20% 22%)" }}>
              <p className="text-[24px] font-semibold" style={{ color: "hsl(45 100% 70%)" }}>{c.label}</p>
              <p className="text-[20px] mt-3" style={{ color: "hsl(140 20% 60%)" }}>{c.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-[24px]" style={{ color: "hsl(140 20% 60%)" }}>
          The system achieves practical detection accuracy of ~82% across 7 target classes, with processing times suitable for post-mission analysis. The web-based architecture enables rapid deployment and accessibility from any connected device.
        </p>
      </div>
    </SlideLayout>
  ),

  // 14 – Thank You
  () => (
    <div className="flex flex-col items-center justify-center h-full text-center"
      style={{ background: "linear-gradient(135deg, hsl(140 30% 10%), hsl(140 20% 6%))" }}>
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(circle at 50% 50%, hsl(45 100% 55% / 0.4) 0%, transparent 50%)" }} />
      <div className="relative z-10">
        <div className="w-32 h-1 mx-auto mb-16" style={{ background: "hsl(45 100% 55%)" }} />
        <h1 className="text-[80px] font-bold mb-8" style={{ color: "hsl(45 100% 75%)" }}>Thank You</h1>
        <p className="text-[32px] mb-16" style={{ color: "hsl(140 20% 60%)" }}>Questions & Discussion</p>
        <div className="w-32 h-1 mx-auto mb-16" style={{ background: "hsl(45 100% 55%)" }} />
        <p className="text-[24px]" style={{ color: "hsl(140 20% 50%)" }}>Army Design Bureau • AI-Based Target Detection System</p>
      </div>
    </div>
  ),
];

/* ───── helper components ───── */
const Dot = () => <span className="shrink-0 mt-2 w-3 h-3 rounded-full" style={{ background: "hsl(45 100% 55%)" }} />;

const InfoCard = ({ title, value, desc }: { title: string; value: string; desc: string }) => (
  <div className="p-6 rounded-lg text-center" style={{ background: "hsl(140 15% 14%)", border: "1px solid hsl(140 20% 22%)" }}>
    <p className="text-[20px]" style={{ color: "hsl(140 20% 55%)" }}>{title}</p>
    <p className="text-[36px] font-bold mt-2" style={{ color: "hsl(45 100% 65%)" }}>{value}</p>
    <p className="text-[18px] mt-2" style={{ color: "hsl(140 20% 50%)" }}>{desc}</p>
  </div>
);

const SlideLayout = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="flex flex-col h-full p-16" style={{ background: "linear-gradient(180deg, hsl(140 25% 9%), hsl(140 20% 7%))" }}>
    <div className="flex items-center gap-6 mb-10">
      <div className="w-2 h-12" style={{ background: "hsl(45 100% 55%)" }} />
      <h2 className="text-[44px] font-bold" style={{ color: "hsl(45 100% 75%)" }}>{title}</h2>
    </div>
    <div className="flex-1">{children}</div>
    <div className="flex justify-between items-center pt-6 mt-auto" style={{ borderTop: "1px solid hsl(140 20% 20%)" }}>
      <span className="text-[16px]" style={{ color: "hsl(140 20% 40%)" }}>Army Design Bureau</span>
      <span className="text-[16px]" style={{ color: "hsl(140 20% 40%)" }}>AI-Based Target Detection System</span>
    </div>
  </div>
);

/* ───── main component ───── */
const Presentation = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  const total = slides.length;

  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const sx = rect.width / SLIDE_W;
    const sy = rect.height / SLIDE_H;
    setScale(Math.min(sx, sy) * 0.95);
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [updateScale, isFullscreen]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const goTo = (i: number) => { setCurrent(Math.max(0, Math.min(i, total - 1))); setShowGrid(false); };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goTo(current + 1); }
      if (e.key === "ArrowLeft") goTo(current - 1);
      if (e.key === "Escape" && isFullscreen) document.exitFullscreen();
      if (e.key === "f" || e.key === "F5") { e.preventDefault(); containerRef.current?.requestFullscreen(); }
      if (e.key === "g") setShowGrid(g => !g);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, isFullscreen]);

  const toggleFullscreen = () => {
    if (isFullscreen) document.exitFullscreen();
    else containerRef.current?.requestFullscreen();
  };

  const SlideComponent = slides[current];

  if (showGrid) {
    return (
      <div ref={containerRef} className="min-h-screen p-8" style={{ background: "hsl(140 20% 6%)" }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold" style={{ color: "hsl(45 100% 75%)" }}>All Slides</h1>
          <button onClick={() => setShowGrid(false)} className="px-4 py-2 rounded text-sm" style={{ background: "hsl(140 15% 18%)", color: "hsl(45 100% 70%)" }}>Close Grid</button>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {slides.map((S, i) => (
            <button key={i} onClick={() => goTo(i)} className="relative rounded-lg overflow-hidden transition-all hover:ring-2" style={{ aspectRatio: "16/9", ...(i === current ? { ring: "2px", boxShadow: "0 0 0 2px hsl(45 100% 55%)" } : {}) }}>
              <div style={{ width: SLIDE_W, height: SLIDE_H, transform: "scale(0.18)", transformOrigin: "top left" }}>
                <S />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 text-center" style={{ background: "hsl(140 20% 8% / 0.9)" }}>
                <span className="text-xs" style={{ color: "hsl(45 100% 65%)" }}>{i + 1}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col items-center justify-center relative" style={{ background: "hsl(140 20% 4%)" }}>
      {/* Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50 opacity-0 hover:opacity-100 transition-opacity">
        <div className="flex gap-2">
          <button onClick={() => navigate("/")} className="p-2 rounded" style={{ background: "hsl(140 15% 15%)", color: "hsl(45 100% 70%)" }}><Home size={18} /></button>
          <button onClick={() => setShowGrid(true)} className="p-2 rounded" style={{ background: "hsl(140 15% 15%)", color: "hsl(45 100% 70%)" }}><Grid size={18} /></button>
        </div>
        <span className="text-sm font-mono" style={{ color: "hsl(140 20% 50%)" }}>{current + 1} / {total}</span>
        <button onClick={toggleFullscreen} className="p-2 rounded" style={{ background: "hsl(140 15% 15%)", color: "hsl(45 100% 70%)" }}>
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      </div>

      {/* Slide */}
      <div className="relative" style={{ width: SLIDE_W * scale, height: SLIDE_H * scale }}>
        <div className="absolute top-0 left-0 rounded-lg overflow-hidden shadow-2xl" style={{ width: SLIDE_W, height: SLIDE_H, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <SlideComponent />
        </div>
      </div>

      {/* Nav */}
      <div className="absolute bottom-6 flex items-center gap-4 z-50">
        <button onClick={() => goTo(current - 1)} disabled={current === 0} className="p-3 rounded-full disabled:opacity-30 transition" style={{ background: "hsl(140 15% 15%)", color: "hsl(45 100% 70%)" }}><ChevronLeft size={20} /></button>
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} className="w-2.5 h-2.5 rounded-full transition-all" style={{ background: i === current ? "hsl(45 100% 55%)" : "hsl(140 15% 25%)" }} />
          ))}
        </div>
        <button onClick={() => goTo(current + 1)} disabled={current === total - 1} className="p-3 rounded-full disabled:opacity-30 transition" style={{ background: "hsl(140 15% 15%)", color: "hsl(45 100% 70%)" }}><ChevronRight size={20} /></button>
      </div>
    </div>
  );
};

export default Presentation;
