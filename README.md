# AI-Based Automated Target Detection for AFVs

A real-time AI-powered target detection system designed for Armoured Fighting Vehicles (AFVs). The system analyzes tactical images and video footage to identify threats such as camouflaged personnel, military vehicles, concealed positions, and fortifications.

---

## Features

- **Image & Video Detection** – Upload surveillance images or tactical video footage for AI-powered threat analysis
- **Visual Threat Overlays** – Detected threats are highlighted with targeting circles, labels, and confidence percentages directly on the media
- **Multi-Class Classification** – Categorizes threats into MBTs, IFVs, infantry squads, ATGMs, fortifications, and more
- **Structured Analysis Reports** – Detailed intelligence reports with frame captures, findings, terrain assessment, and tactical recommendations
- **Automated Telegram Alerts** – High/critical threat detections automatically trigger notifications via Telegram with detection images
- **Operations Dashboard** – Real-time metrics, detection history, and CSV export for mission debriefing
- **Detection Logging** – All analyses stored with timestamps, metadata, and threat levels for review

---

## Technology Stack

### Frontend
- React 18 – UI Framework
- TypeScript – Type Safety
- Vite – Build Tool
- Tailwind CSS – Styling
- Shadcn UI – Component Library

### Backend
- Supabase – Database & Backend Infrastructure
- Edge Functions – Serverless Processing
- n8n Workflow – Automation & Integration
- PostgreSQL – Data Persistence

### AI / ML
- YOLOv8 – Object Detection Model
- Custom-trained on military threat datasets
- Multi-class threat classification pipeline

---

## System Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend UI   │────▶│  Edge Functions   │────▶│  YOLOv8 Model   │
│  (React + TS)   │◀────│  (Supabase)       │◀────│  Detection API  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌──────────────┐
                        │  PostgreSQL   │
                        │  (Supabase)   │
                        └──────────────┘
```

1. **Image/Video Acquisition Layer** – File upload with format validation, frame extraction from video (1 frame per 2 seconds)
2. **AI Processing Layer** – YOLOv8-based detection via Edge Functions with structured JSON output
3. **Visualization Layer** – Threat overlays rendered on canvas with color-coded markers
4. **Integration Layer** – Telegram alerts for critical threats, n8n webhook automation
5. **Persistence Layer** – Detection logs stored in PostgreSQL with JSONB metadata

---

## Detection Categories

| Category | Types |
|----------|-------|
| Vehicles | MBT, IFV, APC, MRAP, Technical, Artillery |
| Personnel | Infantry Squad, Fire Team, Sniper Team, Heavy Weapons Team |
| Structures | Fortification, Observation Post, Command Post, Checkpoint |
| Weapon Systems | ATGM, MANPADS, Mortar, Machine Gun, RPG |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or bun

### Installation

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## Database Schema

```sql
detection_logs {
  id: UUID (PK)
  session_id: UUID
  source_type: TEXT ("image" | "video")
  analysis_result: TEXT
  threat_level: TEXT
  confidence_score: FLOAT
  detected_objects: JSONB
  image_thumbnail: TEXT
  processing_time_ms: INT
  metadata: JSONB
  created_at: TIMESTAMPTZ
}
```

---

## Project Structure

```
src/
├── components/
│   ├── Hero.tsx              # Landing section
│   ├── Features.tsx          # System capabilities
│   ├── DetectionTabs.tsx     # Tabbed detection interface
│   ├── ImageDetection.tsx    # Image analysis with overlays
│   ├── VideoDetection.tsx    # Video analysis with overlays
│   ├── AnalysisReport.tsx    # Structured report view
│   └── Dashboard.tsx         # Operations dashboard
├── pages/
│   ├── Index.tsx             # Main page
│   └── Documentation.tsx     # System documentation
supabase/
├── functions/
│   ├── analyze-image/        # Image detection endpoint
│   ├── analyze-video/        # Video detection endpoint
│   ├── analyze-target/       # Legacy target analysis
│   └── send-telegram-alert/  # Telegram notification
```

---

## License

This project is developed for the Army Design Bureau. All rights reserved.
