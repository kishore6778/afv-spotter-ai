import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crosshair, Image as ImageIcon } from "lucide-react";
import VideoDetection from "./VideoDetection";
import ImageDetection from "./ImageDetection";

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

interface DetectionTabsProps {
  onReportGenerated: (report: AnalysisReport, frameCaptures: string[]) => void;
}

const DetectionTabs = ({ onReportGenerated }: DetectionTabsProps) => {
  return (
    <section className="py-20 bg-tactical-dark/50" id="detection">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            <Crosshair className="inline w-8 h-8 mr-2 text-tactical-amber" />
            AI THREAT DETECTION INTERFACE
          </h2>
          <p className="text-muted-foreground font-mono">
            Select detection mode for AI-powered threat analysis with automated Telegram alerts
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="image" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 h-12 bg-tactical-dark border border-border">
              <TabsTrigger
                value="image"
                className="font-mono font-bold text-sm gap-2 data-[state=active]:bg-tactical-amber data-[state=active]:text-tactical-dark"
              >
                <ImageIcon className="w-4 h-4" />
                IMAGE DETECTION
              </TabsTrigger>
              <TabsTrigger
                value="video"
                className="font-mono font-bold text-sm gap-2 data-[state=active]:bg-tactical-amber data-[state=active]:text-tactical-dark"
              >
                <Crosshair className="w-4 h-4" />
                VIDEO DETECTION
              </TabsTrigger>
            </TabsList>

            <TabsContent value="image">
              <ImageDetection onReportGenerated={onReportGenerated} />
            </TabsContent>

            <TabsContent value="video">
              <VideoDetection onReportGenerated={onReportGenerated} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default DetectionTabs;
