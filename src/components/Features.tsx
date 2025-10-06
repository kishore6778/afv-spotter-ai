import { Shield, Zap, Eye, Database } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Advanced Detection",
    description: "AI-powered vision system capable of detecting camouflaged targets in complex environments"
  },
  {
    icon: Zap,
    title: "Real-Time Processing",
    description: "Sub-second response time for rapid threat assessment and engagement decisions"
  },
  {
    icon: Eye,
    title: "Multi-Spectrum Analysis",
    description: "Comprehensive analysis using advanced computer vision and pattern recognition"
  },
  {
    icon: Database,
    title: "Extensive Training",
    description: "Trained on large datasets of tactical scenarios for maximum accuracy"
  }
];

const Features = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">SYSTEM CAPABILITIES</h2>
          <p className="text-muted-foreground font-mono">Mission-critical features for AFV operations</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 bg-card border-border hover:border-tactical-amber transition-all">
              <feature.icon className="w-12 h-12 text-tactical-amber mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2 font-mono">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
