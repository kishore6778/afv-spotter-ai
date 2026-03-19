import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, Crosshair, AlertTriangle, SkipForward, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Detection {
  label: string;
  threat_type: string;
  confidence: number;
  threat_level: string;
  x_percent: number;
  y_percent: number;
  description: string;
}

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

interface ImageDetectionProps {
  onReportGenerated: (report: AnalysisReport, frameCaptures: string[]) => void;
}

const ImageDetection = ({ onReportGenerated }: ImageDetectionProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [sceneSummary, setSceneSummary] = useState("");
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const TELEGRAM_CHAT_ID = "7532156587";
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setDetections([]);
      setAnalysisComplete(false);
      setSceneSummary("");

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast({ title: "Invalid File", description: "Please upload an image file (JPG, PNG, etc).", variant: "destructive" });
    }
  };

  const analyzeImage = async () => {
    if (!imageDataUrl) return;
    setIsAnalyzing(true);
    setDetections([]);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-image', {
        body: { image: imageDataUrl, mode: 'detect' }
      });
      if (error) throw error;

      const newDetections = data.detections || [];
      setDetections(newDetections);
      setSceneSummary(data.scene_summary || "");
      setAnalysisComplete(true);

      // Log to database
      const avgConfidence = newDetections.length > 0
        ? newDetections.reduce((s: number, d: Detection) => s + d.confidence, 0) / newDetections.length
        : 0;
      const maxThreat = newDetections.reduce((max: string, d: Detection) => {
        const levels: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 };
        return (levels[d.threat_level] || 0) > (levels[max] || 0) ? d.threat_level : max;
      }, 'NONE');

      try {
        await supabase.from('detection_logs').insert([{
          analysis_result: JSON.stringify({ detections: newDetections, scene_summary: data.scene_summary }),
          threat_level: maxThreat.toLowerCase(),
          detected_objects: JSON.parse(JSON.stringify(newDetections)),
          confidence_score: avgConfidence,
          processing_time_ms: 0,
          source_type: 'image',
          metadata: JSON.parse(JSON.stringify({ detection_count: newDetections.length }))
        }] as any);
      } catch (e) {
        console.error("Logging error:", e);
      }

      // Auto-send Telegram alert if HIGH or CRITICAL threat detected
      if (newDetections.length > 0 && (maxThreat === 'CRITICAL' || maxThreat === 'HIGH')) {
        sendTelegramAlert(newDetections, data.scene_summary || "", maxThreat);
      }

      toast({ title: "Analysis Complete", description: `Detected ${newDetections.length} potential threat(s).` });
    } catch (err) {
      toast({ title: "Analysis Failed", description: err instanceof Error ? err.message : "Failed to analyze image", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateReport = async () => {
    if (!imageDataUrl) return;
    setIsGeneratingReport(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-image', {
        body: { image: imageDataUrl, mode: 'report' }
      });
      if (error) throw error;
      onReportGenerated(data as AnalysisReport, [imageDataUrl]);
      toast({ title: "Report Generated", description: "Scroll down to view the detailed analysis report." });
    } catch (err) {
      toast({ title: "Report Failed", description: err instanceof Error ? err.message : "Failed to generate report", variant: "destructive" });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const sendTelegramAlert = async (dets?: Detection[], summary?: string, threatLvl?: string) => {
    const alertDetections = dets || detections;
    const alertSummary = summary || sceneSummary;
    const alertThreat = threatLvl || alertDetections.reduce((max: string, d: Detection) => {
      const levels: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 };
      return (levels[d.threat_level] || 0) > (levels[max] || 0) ? d.threat_level : max;
    }, 'NONE');

    setIsSendingAlert(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-telegram-alert', {
        body: {
          chat_id: TELEGRAM_CHAT_ID,
          threat_level: alertThreat,
          detections: alertDetections,
          scene_summary: alertSummary,
          image_base64: imageDataUrl,
          source_type: 'image'
        }
      });
      if (error) throw error;
      toast({ title: "Alert Sent ✅", description: "Threat notification sent to Telegram successfully." });
    } catch (err) {
      toast({ title: "Alert Failed", description: err instanceof Error ? err.message : "Failed to send Telegram alert", variant: "destructive" });
    } finally {
      setIsSendingAlert(false);
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'hsl(0, 70%, 50%)';
      case 'HIGH': return 'hsl(25, 90%, 55%)';
      case 'MEDIUM': return 'hsl(45, 100%, 55%)';
      case 'LOW': return 'hsl(120, 50%, 45%)';
      default: return 'hsl(210, 10%, 50%)';
    }
  };

  const getThreatBadgeVariant = (level: string): "default" | "secondary" | "destructive" | "outline" => {
    if (level === 'CRITICAL' || level === 'HIGH') return 'destructive';
    if (level === 'MEDIUM') return 'secondary';
    return 'outline';
  };

  return (
    <div id="image-detection">
      <div className="container mx-auto px-4">

        <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Image Viewer with Overlay */}
          <Card className="lg:col-span-2 p-4 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground font-mono">IMAGE FEED</h3>
              {isAnalyzing && (
                <Badge className="bg-tactical-amber text-tactical-dark font-mono">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Analyzing...
                </Badge>
              )}
            </div>

            <div className="relative aspect-video bg-tactical-dark border border-border rounded-xl overflow-hidden">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt="Uploaded surveillance image"
                    className="w-full h-full object-contain"
                  />
                  {/* Detection Overlays */}
                  <div className="absolute inset-0 pointer-events-none">
                    {detections.map((det, i) => (
                      <div
                        key={i}
                        className="absolute flex flex-col items-center"
                        style={{
                          left: `${det.x_percent}%`,
                          top: `${det.y_percent}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        {/* Targeting circle */}
                        <div
                          className="rounded-full border-2 animate-pulse"
                          style={{
                            width: '60px',
                            height: '60px',
                            borderColor: getThreatColor(det.threat_level),
                            boxShadow: `0 0 12px ${getThreatColor(det.threat_level)}`,
                          }}
                        />
                        {/* Crosshair lines */}
                        <div className="absolute" style={{ width: '80px', height: '80px' }}>
                          <div className="absolute top-1/2 left-0 w-2 h-0.5" style={{ backgroundColor: getThreatColor(det.threat_level) }} />
                          <div className="absolute top-1/2 right-0 w-2 h-0.5" style={{ backgroundColor: getThreatColor(det.threat_level) }} />
                          <div className="absolute left-1/2 top-0 w-0.5 h-2" style={{ backgroundColor: getThreatColor(det.threat_level) }} />
                          <div className="absolute left-1/2 bottom-0 w-0.5 h-2" style={{ backgroundColor: getThreatColor(det.threat_level) }} />
                        </div>
                        {/* Label */}
                        <div
                          className="mt-1 px-2 py-0.5 rounded text-xs font-mono font-bold whitespace-nowrap"
                          style={{
                            backgroundColor: getThreatColor(det.threat_level),
                            color: '#000',
                          }}
                        >
                          {det.label} — {det.confidence}%
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground font-mono gap-3">
                  <Upload className="w-12 h-12 opacity-50" />
                  <p>Upload an image to begin</p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="flex-1">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
              </div>

              {imageUrl && (
                <div className="flex gap-2">
                  <Button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className="flex-1 bg-tactical-amber text-tactical-dark hover:bg-tactical-amber/90"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Crosshair className="w-4 h-4 mr-2" />
                        {analysisComplete ? 'Re-Analyze Image' : 'Analyze Image'}
                      </>
                    )}
                  </Button>
                  {analysisComplete && (
                    <Button
                      onClick={generateReport}
                      disabled={isGeneratingReport}
                      variant="secondary"
                      className="flex-1"
                    >
                      {isGeneratingReport ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                      ) : (
                        <><SkipForward className="w-4 h-4 mr-2" />Generate Report</>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Detection Panel */}
          <Card className="p-4 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground font-mono mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-tactical-amber" />
              DETECTIONS
            </h3>

            {sceneSummary && (
              <div className="mb-4 p-3 bg-tactical-dark rounded border border-border">
                <p className="text-xs text-muted-foreground font-mono mb-1">SCENE</p>
                <p className="text-sm text-foreground">{sceneSummary}</p>
              </div>
            )}

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {detections.length === 0 ? (
                <div className="text-center text-muted-foreground font-mono py-12">
                  <Crosshair className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{imageUrl ? 'Run analysis to detect threats' : 'Upload an image to begin'}</p>
                </div>
              ) : (
                detections.map((det, i) => (
                  <Card key={i} className="p-3 bg-tactical-dark border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getThreatColor(det.threat_level) }}
                        />
                        <span className="font-mono font-bold text-sm text-foreground">{det.label}</span>
                      </div>
                      <Badge variant={getThreatBadgeVariant(det.threat_level)} className="font-mono text-xs">
                        {det.threat_level}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{det.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="font-mono text-xs">{det.threat_type}</Badge>
                      <span className="text-xs font-mono text-muted-foreground">Conf: {det.confidence}%</span>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Summary stats */}
            {detections.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-tactical-dark rounded">
                    <p className="text-2xl font-bold text-foreground font-mono">{detections.length}</p>
                    <p className="text-xs text-muted-foreground font-mono">TARGETS</p>
                  </div>
                  <div className="text-center p-2 bg-tactical-dark rounded">
                    <p className="text-2xl font-bold text-foreground font-mono">
                      {detections.length > 0 ? Math.round(detections.reduce((s, d) => s + d.confidence, 0) / detections.length) : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">AVG CONF</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ImageDetection;
