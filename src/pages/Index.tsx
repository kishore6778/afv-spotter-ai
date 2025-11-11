import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import DetectionInterface from "@/components/DetectionInterface";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4 z-50">
        <Button 
          onClick={() => navigate('/documentation')}
          variant="outline"
          className="gap-2 font-mono"
        >
          <FileText className="w-4 h-4" />
          View Documentation
        </Button>
      </div>

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
