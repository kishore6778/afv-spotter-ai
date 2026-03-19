import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Upload, Play, Pause, SkipForward, Loader2, Crosshair, AlertTriangle } from "lucide-react";
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

interface FrameDetection {
  frameIndex: number;
  timestamp: number;
  detections: Detection[];
  sceneSummary: string;
  frameDataUrl: string;
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

interface VideoDetectionProps {
  onReportGenerated: (report: AnalysisReport, frameCaptures: string[]) => void;
}

const VideoDetection = ({ onReportGenerated }: VideoDetectionProps) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [currentDetections, setCurrentDetections] = useState<Detection[]>([]);
  const [sceneSummary, setSceneSummary] = useState("");
  const [allFrameDetections, setAllFrameDetections] = useState<FrameDetection[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [isSendingAlert, setIsSendingAlert] = useState(false);

  const TELEGRAM_CHAT_ID = "7532156587";
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animFrameRef = useRef<number>(0);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setCurrentDetections([]);
      setAllFrameDetections([]);
      setAnalysisProgress(0);
      setAnalysisComplete(false);
      setSceneSummary("");
    } else {
      toast({ title: "Invalid File", description: "Please upload a video file.", variant: "destructive" });
    }
  };

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.7);
  }, []);

  const analyzeFrame = useCallback(async (frameDataUrl: string): Promise<{ detections: Detection[]; scene_summary: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-video', {
        body: { frames: [frameDataUrl], mode: 'detect' }
      });
      if (error) throw error;
      return { detections: data.detections || [], scene_summary: data.scene_summary || "" };
    } catch (err) {
      console.error("Frame analysis error:", err);
      return { detections: [], scene_summary: "" };
    }
  }, []);

  const startAnalysis = async () => {
    if (!videoRef.current || !videoUrl) return;

    setIsAnalyzing(true);
    setAllFrameDetections([]);
    setAnalysisProgress(0);
    setAnalysisComplete(false);

    const video = videoRef.current;
    const totalDuration = video.duration;
    // Analyze every 2 seconds of video
    const interval = 2;
    const totalFrames = Math.ceil(totalDuration / interval);
    const frameDetections: FrameDetection[] = [];

    for (let i = 0; i < totalFrames; i++) {
      const seekTime = i * interval;
      video.currentTime = seekTime;

      // Wait for seek
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          resolve();
        };
        video.addEventListener('seeked', onSeeked);
      });

      const frameData = captureFrame();
      if (!frameData) continue;

      const result = await analyzeFrame(frameData);
      
      setCurrentDetections(result.detections);
      setSceneSummary(result.scene_summary);

      frameDetections.push({
        frameIndex: i,
        timestamp: seekTime,
        detections: result.detections,
        sceneSummary: result.scene_summary,
        frameDataUrl: frameData
      });

      setAllFrameDetections([...frameDetections]);
      setAnalysisProgress(Math.round(((i + 1) / totalFrames) * 100));
    }

    setIsAnalyzing(false);
    setAnalysisComplete(true);

    // Log to database
    const allDetections = frameDetections.flatMap(f => f.detections);
    const avgConfidence = allDetections.length > 0 
      ? allDetections.reduce((s, d) => s + d.confidence, 0) / allDetections.length 
      : 0;
    const maxThreat = allDetections.reduce((max, d) => {
      const levels: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 };
      return (levels[d.threat_level] || 0) > (levels[max] || 0) ? d.threat_level : max;
    }, 'NONE');

    try {
      await supabase.from('detection_logs').insert([{
        analysis_result: JSON.stringify(frameDetections.map(f => ({ timestamp: f.timestamp, detections: f.detections, summary: f.sceneSummary }))),
        threat_level: maxThreat.toLowerCase(),
        detected_objects: JSON.parse(JSON.stringify(allDetections)),
        confidence_score: avgConfidence,
        processing_time_ms: Math.round(totalDuration * 1000),
        source_type: 'video',
        metadata: JSON.parse(JSON.stringify({ total_frames_analyzed: frameDetections.length, video_duration: totalDuration }))
      }] as any);
    } catch (e) {
      console.error("Logging error:", e);
    }

    // Auto-send Telegram alert if HIGH or CRITICAL threat detected
    if (allDetections.length > 0 && (maxThreat === 'CRITICAL' || maxThreat === 'HIGH')) {
      const keyFrame = frameDetections.find(f => f.detections.length > 0);
      setIsSendingAlert(true);
      try {
        await supabase.functions.invoke('send-telegram-alert', {
          body: {
            chat_id: TELEGRAM_CHAT_ID,
            threat_level: maxThreat,
            detections: allDetections.slice(0, 10),
            scene_summary: keyFrame?.sceneSummary || "",
            image_base64: keyFrame?.frameDataUrl || null,
            source_type: 'video'
          }
        });
        toast({ title: "Alert Sent ✅", description: "Threat notification automatically sent to Telegram." });
      } catch (err) {
        toast({ title: "Alert Failed", description: err instanceof Error ? err.message : "Failed to send alert", variant: "destructive" });
      } finally {
        setIsSendingAlert(false);
      }
    }

    toast({ title: "Analysis Complete", description: `Analyzed ${frameDetections.length} frames. Generate report for detailed findings.` });
  };

  const generateReport = async () => {
    if (allFrameDetections.length === 0) return;

    setIsGeneratingReport(true);

    // Pick key frames (max 6 to stay within limits)
    const keyFrames = allFrameDetections
      .filter(f => f.detections.length > 0)
      .slice(0, 6);
    
    // If no detections, use evenly spaced frames
    const framesToSend = keyFrames.length > 0 
      ? keyFrames 
      : allFrameDetections.filter((_, i) => i % Math.ceil(allFrameDetections.length / 4) === 0).slice(0, 4);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-video', {
        body: { 
          frames: framesToSend.map(f => f.frameDataUrl), 
          mode: 'report' 
        }
      });

      if (error) throw error;

      onReportGenerated(data as AnalysisReport, framesToSend.map(f => f.frameDataUrl));
      toast({ title: "Report Generated", description: "Scroll down to view the detailed analysis report." });
    } catch (err) {
      toast({ title: "Report Failed", description: err instanceof Error ? err.message : "Failed to generate report", variant: "destructive" });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Update time display
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => setDuration(video.duration);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [videoUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
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
    <section className="py-20 bg-tactical-dark/50" id="detection">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            <Crosshair className="inline w-8 h-8 mr-2 text-tactical-amber" />
            VIDEO DETECTION INTERFACE
          </h2>
          <p className="text-muted-foreground font-mono">Upload a video for AI-powered threat detection with visual overlays</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Video Player with Overlay */}
          <Card className="lg:col-span-2 p-4 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground font-mono">VIDEO FEED</h3>
              {isAnalyzing && (
                <Badge className="bg-tactical-amber text-tactical-dark font-mono">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Analyzing Frame...
                </Badge>
              )}
            </div>

            <div className="relative aspect-video bg-tactical-dark border border-border rounded overflow-hidden">
              {videoUrl ? (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    playsInline
                  />
                  {/* Detection Overlays */}
                  <div ref={overlayRef} className="absolute inset-0 pointer-events-none">
                    {currentDetections.map((det, i) => (
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
                  <p>Upload a video to begin</p>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {/* Controls */}
            <div className="mt-4 space-y-3">
              {videoUrl && (
                <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <Progress value={duration > 0 ? (currentTime / duration) * 100 : 0} className="flex-1 h-1.5" />
                  <span>{formatTime(duration)}</span>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="video/*"
                  className="hidden"
                />
                <Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="flex-1">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </Button>
                {videoUrl && (
                  <Button onClick={togglePlay} variant="secondary">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                )}
              </div>

              {videoUrl && (
                <div className="flex gap-2">
                  <Button
                    onClick={startAnalysis}
                    disabled={isAnalyzing || !videoUrl}
                    className="flex-1 bg-tactical-amber text-tactical-dark hover:bg-tactical-amber/90"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing... {analysisProgress}%
                      </>
                    ) : (
                      <>
                        <Crosshair className="w-4 h-4 mr-2" />
                        {analysisComplete ? 'Re-Analyze Video' : 'Analyze Video'}
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

              {/* Telegram Alert */}
              {analysisComplete && allFrameDetections.some(f => f.detections.length > 0) && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Telegram Chat ID"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    onClick={async () => {
                      if (!telegramChatId) {
                        toast({ title: "Chat ID Required", description: "Enter your Telegram Chat ID.", variant: "destructive" });
                        return;
                      }
                      setIsSendingAlert(true);
                      const allDets = allFrameDetections.flatMap(f => f.detections);
                      const maxThreat = allDets.reduce((max, d) => {
                        const levels: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 };
                        return (levels[d.threat_level] || 0) > (levels[max] || 0) ? d.threat_level : max;
                      }, 'NONE');
                      const keyFrame = allFrameDetections.find(f => f.detections.length > 0);
                      try {
                        await supabase.functions.invoke('send-telegram-alert', {
                          body: {
                            chat_id: telegramChatId,
                            threat_level: maxThreat,
                            detections: allDets.slice(0, 10),
                            scene_summary: keyFrame?.sceneSummary || sceneSummary,
                            image_base64: keyFrame?.frameDataUrl || null,
                            source_type: 'video'
                          }
                        });
                        toast({ title: "Alert Sent ✅", description: "Threat notification sent to Telegram." });
                      } catch (err) {
                        toast({ title: "Alert Failed", description: err instanceof Error ? err.message : "Failed to send alert", variant: "destructive" });
                      } finally {
                        setIsSendingAlert(false);
                      }
                    }}
                    disabled={isSendingAlert || !telegramChatId}
                    variant="secondary"
                    className="gap-2"
                  >
                    {isSendingAlert ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send Alert
                  </Button>
                </div>
              )}

              {isAnalyzing && (
                <Progress value={analysisProgress} className="h-2" />
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
              {currentDetections.length === 0 ? (
                <div className="text-center text-muted-foreground font-mono py-12">
                  <Crosshair className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{videoUrl ? 'Run analysis to detect threats' : 'Upload a video to begin'}</p>
                </div>
              ) : (
                currentDetections.map((det, i) => (
                  <div key={i} className="p-3 bg-tactical-dark rounded border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-foreground font-mono">{det.label}</span>
                      <Badge variant={getThreatBadgeVariant(det.threat_level)} className="font-mono text-xs">
                        {det.threat_level}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>{det.threat_type}</span>
                      <span className="font-mono font-bold text-tactical-amber">{det.confidence}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{det.description}</p>
                  </div>
                ))
              )}
            </div>

            {allFrameDetections.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground font-mono mb-2">ANALYSIS SUMMARY</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-tactical-dark p-2 rounded">
                    <p className="text-xs text-muted-foreground">Frames</p>
                    <p className="font-bold text-foreground font-mono">{allFrameDetections.length}</p>
                  </div>
                  <div className="bg-tactical-dark p-2 rounded">
                    <p className="text-xs text-muted-foreground">Threats Found</p>
                    <p className="font-bold text-foreground font-mono">
                      {allFrameDetections.reduce((s, f) => s + f.detections.length, 0)}
                    </p>
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

export default VideoDetection;
