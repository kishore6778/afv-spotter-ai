import { 
  Video, 
  Crosshair, 
  Brain, 
  Layers, 
  History, 
  LayoutDashboard, 
  RefreshCw, 
  Wifi 
} from "lucide-react";
import { Card } from "@/components/ui/card";

const enhancedFeatures = [
  {
    icon: Video,
    title: "Real-Time Video Streaming",
    description: "Live camera feed analysis with low latency detection and overlay boxes"
  },
  {
    icon: Crosshair,
    title: "Object Tracking",
    description: "Consistent target identification across frames with unique tracking IDs"
  },
  {
    icon: Brain,
    title: "Enhanced Detection Models",
    description: "Improved accuracy for small, hidden, and partially visible targets"
  },
  {
    icon: Layers,
    title: "Multi-Class Classification",
    description: "Detailed categorization of vehicles, personnel, structures, and weapons"
  },
  {
    icon: History,
    title: "Historical Logging",
    description: "Complete detection history with timestamps, metadata, and replay capability"
  },
  {
    icon: LayoutDashboard,
    title: "Advanced Dashboard",
    description: "Live metrics, system status, and performance monitoring in real-time"
  },
  {
    icon: RefreshCw,
    title: "Automated Training",
    description: "Continuous model updates and evaluation with new labeled data"
  },
  {
    icon: Wifi,
    title: "Offline & Edge Deployment",
    description: "Full operation on local hardware without internet connectivity"
  }
];

const EnhancedFeatures = () => {
  return (
    <section className="py-16 bg-tactical-dark/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-2">ENHANCED CAPABILITIES</h2>
          <p className="text-muted-foreground font-mono text-sm">Advanced features for tactical superiority</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {enhancedFeatures.map((feature, index) => (
            <Card 
              key={index} 
              className="p-5 bg-card border-border hover:border-tactical-amber transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-tactical-amber/10 rounded group-hover:bg-tactical-amber/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-tactical-amber" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-1 font-mono">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EnhancedFeatures;
