import { Video, Crosshair, Brain, Layers, FileText, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Video,
    title: "Video Upload & Playback",
    description: "Upload tactical footage in standard formats. The system processes each frame sequentially for comprehensive analysis."
  },
  {
    icon: Crosshair,
    title: "Visual Threat Markers",
    description: "Detected threats are highlighted with circles and labels directly on the video, showing type and confidence percentage."
  },
  {
    icon: Brain,
    title: "AI-Powered Detection",
    description: "YOLOv8 deep learning model analyzes each frame to identify vehicles, personnel, structures, and weapon systems."
  },
  {
    icon: Layers,
    title: "Multi-Class Classification",
    description: "Categorizes threats into MBTs, IFVs, infantry, ATGMs, fortifications, and more with individual confidence scores."
  },
  {
    icon: FileText,
    title: "Structured Analysis Reports",
    description: "After detection, a detailed report is generated with findings, frame snapshots, and tactical recommendations."
  },
  {
    icon: Shield,
    title: "Detection History & Logging",
    description: "All analyses are stored with timestamps and metadata for review, export, and future reference."
  }
];

const Features = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">SYSTEM CAPABILITIES</h2>
          <p className="text-muted-foreground font-mono">Core features of the video-based detection system</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 bg-card border-border hover:border-tactical-amber transition-all">
              <div className="p-3 bg-tactical-amber/10 rounded w-fit mb-4">
                <feature.icon className="w-8 h-8 text-tactical-amber" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 font-mono">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
