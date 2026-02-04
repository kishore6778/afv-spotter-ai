import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Square, Play, Pause, AlertTriangle, Target, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface TrackedObject {
  id: string;
  classification: string;
  confidence: number;
  threatLevel: string;
  position: { x: number; y: number };
  lastSeen: number;
}

const VideoAnalysis = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [trackedObjects, setTrackedObjects] = useState<TrackedObject[]>([]);
  const [frameCount, setFrameCount] = useState(0);
  const [fps, setFps] = useState(0);
  const [analysisInterval, setAnalysisInterval] = useState(2000);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analysisTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fpsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const { toast } = useToast();

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment"
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        setIsPaused(false);
        startContinuousAnalysis();
        startFpsCounter();
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (analysisTimerRef.current) {
      clearInterval(analysisTimerRef.current);
    }
    if (fpsTimerRef.current) {
      clearInterval(fpsTimerRef.current);
    }
    setIsStreaming(false);
    setIsPaused(false);
    setTrackedObjects([]);
    setFrameCount(0);
    setFps(0);
  };

  const togglePause = () => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
      setIsPaused(!isPaused);
    }
  };

  const startFpsCounter = () => {
    fpsTimerRef.current = setInterval(() => {
      const now = performance.now();
      if (lastFrameTimeRef.current > 0) {
        const delta = now - lastFrameTimeRef.current;
        setFps(Math.round(1000 / delta));
      }
      lastFrameTimeRef.current = now;
    }, 1000);
  };

  const captureFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current && !isPaused) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        setFrameCount(prev => prev + 1);
        return canvasRef.current.toDataURL('image/jpeg', 0.7);
      }
    }
    return null;
  }, [isPaused]);

  const analyzeFrame = useCallback(async (imageData: string) => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    const startTime = performance.now();
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-target', {
        body: { imageData }
      });

      if (error) throw error;

      const processingTime = Math.round(performance.now() - startTime);
      
      // Parse the analysis and update tracked objects
      const newObjects = parseAnalysisToObjects(data.analysis, processingTime);
      updateTrackedObjects(newObjects);
      
      // Log to database
      await logDetection(data.analysis, newObjects, processingTime);
      
    } catch (error) {
      console.error("Frame analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing]);

  const parseAnalysisToObjects = (analysis: string, _processingTime: number): TrackedObject[] => {
    const objects: TrackedObject[] = [];
    const targetMatches = analysis.matchAll(/### TARGET (\d+)[\s\S]*?Classification\*\*: ([^\n]+)[\s\S]*?Confidence\*\*: (\d+)%[\s\S]*?Threat Level\*\*: (\w+)/g);
    
    for (const match of targetMatches) {
      objects.push({
        id: `TGT-${match[1].padStart(4, '0')}`,
        classification: match[2].trim(),
        confidence: parseInt(match[3]),
        threatLevel: match[4],
        position: { 
          x: Math.random() * 80 + 10, 
          y: Math.random() * 80 + 10 
        },
        lastSeen: Date.now()
      });
    }
    
    return objects;
  };

  const updateTrackedObjects = (newObjects: TrackedObject[]) => {
    setTrackedObjects(prev => {
      const updated = [...prev];
      const now = Date.now();
      
      // Remove stale objects (not seen in 10 seconds)
      const active = updated.filter(obj => now - obj.lastSeen < 10000);
      
      // Update or add new objects
      newObjects.forEach(newObj => {
        const existingIndex = active.findIndex(o => o.classification === newObj.classification);
        if (existingIndex >= 0) {
          active[existingIndex] = { ...newObj, id: active[existingIndex].id };
        } else {
          active.push(newObj);
        }
      });
      
      return active;
    });
  };

  const logDetection = async (analysis: string, objects: TrackedObject[], processingTime: number) => {
    const primaryThreat = objects.reduce((max, obj) => {
      const levels = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 };
      return (levels[obj.threatLevel as keyof typeof levels] || 0) > (levels[max as keyof typeof levels] || 0) 
        ? obj.threatLevel : max;
    }, 'NONE');

    const avgConfidence = objects.length > 0 
      ? objects.reduce((sum, obj) => sum + obj.confidence, 0) / objects.length 
      : 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from('detection_logs').insert([{
      analysis_result: analysis,
      threat_level: primaryThreat.toLowerCase(),
      detected_objects: JSON.parse(JSON.stringify(objects)),
      confidence_score: avgConfidence,
      processing_time_ms: processingTime,
      source_type: 'video_stream',
      metadata: JSON.parse(JSON.stringify({ frame_count: frameCount, fps }))
    }] as any);
  };

  const startContinuousAnalysis = useCallback(() => {
    analysisTimerRef.current = setInterval(() => {
      const frameData = captureFrame();
      if (frameData && !isAnalyzing) {
        analyzeFrame(frameData);
      }
    }, analysisInterval);
  }, [captureFrame, analyzeFrame, isAnalyzing, analysisInterval]);

  // Draw detection overlay
  useEffect(() => {
    if (overlayRef.current && isStreaming) {
      const ctx = overlayRef.current.getContext('2d');
      if (ctx && videoRef.current) {
        overlayRef.current.width = videoRef.current.offsetWidth;
        overlayRef.current.height = videoRef.current.offsetHeight;
        
        ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
        
        trackedObjects.forEach(obj => {
          const x = (obj.position.x / 100) * overlayRef.current!.width;
          const y = (obj.position.y / 100) * overlayRef.current!.height;
          const boxSize = 80;
          
          // Set color based on threat level
          const colors: Record<string, string> = {
            CRITICAL: '#ef4444',
            HIGH: '#f97316',
            MEDIUM: '#eab308',
            LOW: '#22c55e',
            NONE: '#64748b'
          };
          
          ctx.strokeStyle = colors[obj.threatLevel] || colors.NONE;
          ctx.lineWidth = 2;
          ctx.strokeRect(x - boxSize/2, y - boxSize/2, boxSize, boxSize);
          
          // Draw label
          ctx.fillStyle = colors[obj.threatLevel] || colors.NONE;
          ctx.fillRect(x - boxSize/2, y - boxSize/2 - 20, boxSize, 20);
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px monospace';
          ctx.fillText(`${obj.id} ${obj.confidence}%`, x - boxSize/2 + 4, y - boxSize/2 - 6);
        });
      }
    }
  }, [trackedObjects, isStreaming]);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  const getThreatBadgeVariant = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <section className="py-12 bg-tactical-dark/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            <Video className="inline w-7 h-7 mr-2 text-tactical-amber" />
            REAL-TIME VIDEO ANALYSIS
          </h2>
          <p className="text-muted-foreground font-mono text-sm">Live camera feed with object tracking and detection boxes</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Video Feed */}
          <Card className="lg:col-span-2 p-4 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground font-mono">LIVE FEED</h3>
              <div className="flex items-center gap-2">
                {isStreaming && (
                  <>
                    <Badge variant="outline" className="font-mono">
                      {fps} FPS
                    </Badge>
                    <Badge variant="outline" className="font-mono">
                      Frame: {frameCount}
                    </Badge>
                    {isAnalyzing && (
                      <Badge className="bg-tactical-amber text-tactical-dark">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Analyzing
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <div className="relative aspect-video bg-tactical-dark border border-border rounded overflow-hidden">
              <video 
                ref={videoRef} 
                autoPlay 
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas 
                ref={overlayRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {!isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-mono">
                  <div className="text-center">
                    <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Camera inactive</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              {!isStreaming ? (
                <Button onClick={startStream} className="flex-1 bg-tactical-amber text-tactical-dark hover:bg-tactical-amber/90">
                  <Play className="w-4 h-4 mr-2" />
                  Start Stream
                </Button>
              ) : (
                <>
                  <Button onClick={togglePause} variant="secondary" className="flex-1">
                    {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button onClick={stopStream} variant="destructive" className="flex-1">
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                </>
              )}
            </div>

            <div className="mt-4">
              <label className="text-sm text-muted-foreground font-mono">Analysis Interval: {analysisInterval/1000}s</label>
              <input
                type="range"
                min="500"
                max="5000"
                step="500"
                value={analysisInterval}
                onChange={(e) => setAnalysisInterval(parseInt(e.target.value))}
                className="w-full mt-1"
              />
            </div>
          </Card>

          {/* Tracked Objects */}
          <Card className="p-4 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground font-mono mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-tactical-amber" />
              TRACKED OBJECTS
            </h3>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {trackedObjects.length === 0 ? (
                <div className="text-center text-muted-foreground font-mono py-8">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No objects detected</p>
                </div>
              ) : (
                trackedObjects.map((obj) => (
                  <div 
                    key={obj.id} 
                    className="p-3 bg-tactical-dark rounded border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm text-tactical-amber">{obj.id}</span>
                      <Badge variant={getThreatBadgeVariant(obj.threatLevel)}>
                        {obj.threatLevel}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground font-mono">{obj.classification}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>Confidence: {obj.confidence}%</span>
                      <span>Active</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default VideoAnalysis;
