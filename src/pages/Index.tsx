import { useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import VideoDetection from "@/components/VideoDetection";
import AnalysisReportView from "@/components/AnalysisReport";
import Dashboard from "@/components/Dashboard";

interface AnalysisReport {
  report_title: string;
  overall_threat_level: string;
  confidence_score: number;
  executive_summary: string;
  findings: Array<{
    finding_number: number;
    title: string;
    description: string;
    threat_type: string;
    threat_level: string;
    confidence: number;
    frame_index: number;
    tactical_significance: string;
  }>;
  terrain_assessment: string;
  recommended_actions: string[];
  engagement_priority: Array<{
    priority: number;
    target: string;
    justification: string;
  }>;
}

const Index = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [frameCaptures, setFrameCaptures] = useState<string[]>([]);

  const handleReportGenerated = (newReport: AnalysisReport, frames: string[]) => {
    setReport(newReport);
    setFrameCaptures(frames);
    // Scroll to report
    setTimeout(() => {
      document.getElementById('report')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4 z-50">
        <Button 
          onClick={() => navigate('/documentation')}
          variant="outline"
          className="gap-2 font-mono"
        >
          <FileText className="w-4 h-4" />
          Documentation
        </Button>
      </div>

      <Hero />
      <Features />
      <VideoDetection onReportGenerated={handleReportGenerated} />
      {report && <AnalysisReportView report={report} frameCaptures={frameCaptures} />}
      <Dashboard />
      
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground font-mono text-sm">
            ARMY DESIGN BUREAU | AI-BASED TARGET DETECTION SYSTEM | AUTHORIZED PERSONNEL ONLY
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
