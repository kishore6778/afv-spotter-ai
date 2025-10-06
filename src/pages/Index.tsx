import Hero from "@/components/Hero";
import Features from "@/components/Features";
import DetectionInterface from "@/components/DetectionInterface";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Features />
      <DetectionInterface />
      
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground font-mono text-sm">
            ARMY DESIGN BUREAU | CLASSIFIED SYSTEM | AUTHORIZED PERSONNEL ONLY
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
