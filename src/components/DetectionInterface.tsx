import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Camera, Target, Loader2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const DetectionInterface = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setUseWebcam(true);
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/jpeg');
        setSelectedImage(imageData);
        setUseWebcam(false);
        
        // Stop webcam
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
      }
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-target', {
        body: { imageData: selectedImage }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "Target detection analysis finished successfully.",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze image",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="py-20 bg-tactical-dark/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            <Target className="inline w-8 h-8 mr-2 text-tactical-amber" />
            DETECTION INTERFACE
          </h2>
          <p className="text-muted-foreground font-mono">Upload an image or use webcam for real-time analysis</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-xl font-bold text-foreground mb-4 font-mono">INPUT</h3>
            
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="secondary"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                
                <Button
                  onClick={useWebcam ? captureImage : startWebcam}
                  variant="secondary"
                  className="w-full"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {useWebcam ? 'Capture' : 'Use Webcam'}
                </Button>
              </div>

              <div className="aspect-video bg-tactical-dark border border-border rounded flex items-center justify-center overflow-hidden">
                {useWebcam ? (
                  <video ref={videoRef} autoPlay className="w-full h-full object-cover" />
                ) : selectedImage ? (
                  <img src={selectedImage} alt="Selected" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center text-muted-foreground font-mono">
                    <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No image selected</p>
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <Button
                onClick={analyzeImage}
                disabled={!selectedImage || isAnalyzing}
                className="w-full bg-tactical-amber text-tactical-dark hover:bg-tactical-amber/90"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Analyze Target
                  </>
                )}
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-xl font-bold text-foreground mb-4 font-mono">ANALYSIS RESULTS</h3>
            
            <div className="h-[400px] overflow-y-auto bg-tactical-dark border border-border rounded p-4">
              {analysis ? (
                <div className="text-sm text-foreground font-mono whitespace-pre-wrap">{analysis}</div>
              ) : (
                <div className="text-center text-muted-foreground font-mono h-full flex items-center justify-center">
                  <div>
                    <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Awaiting analysis...</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DetectionInterface;
