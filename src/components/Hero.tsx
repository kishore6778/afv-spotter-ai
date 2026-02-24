import { Shield, Video, Crosshair, BarChart3 } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-tactical-dark via-background to-tactical-green opacity-50" />
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(to right, hsl(var(--tactical-grid)) 1px, transparent 1px),
          linear-gradient(to bottom, hsl(var(--tactical-grid)) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center gap-3 bg-tactical-green/20 border border-tactical-amber/30 px-6 py-3 rounded">
            <Shield className="w-5 h-5 text-tactical-amber" />
            <span className="text-tactical-amber font-mono text-sm tracking-wider">ARMY DESIGN BUREAU</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight">
            AI-BASED AUTOMATED<br />
            <span className="text-tactical-amber">TARGET DETECTION</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl font-mono">
            Video-based threat detection system for Armoured Fighting Vehicles (AFVs). 
            Upload tactical footage for AI-powered analysis with visual threat overlays.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-4xl">
            <div className="bg-card border border-border p-6 rounded flex flex-col items-center">
              <Video className="w-8 h-8 text-tactical-amber mb-3" />
              <div className="text-2xl font-bold text-tactical-amber mb-1">Video Analysis</div>
              <div className="text-sm text-muted-foreground font-mono text-center">Frame-by-frame threat detection</div>
            </div>
            <div className="bg-card border border-border p-6 rounded flex flex-col items-center">
              <Crosshair className="w-8 h-8 text-tactical-amber mb-3" />
              <div className="text-2xl font-bold text-tactical-amber mb-1">Visual Overlay</div>
              <div className="text-sm text-muted-foreground font-mono text-center">Threat markers on video frames</div>
            </div>
            <div className="bg-card border border-border p-6 rounded flex flex-col items-center">
              <BarChart3 className="w-8 h-8 text-tactical-amber mb-3" />
              <div className="text-2xl font-bold text-tactical-amber mb-1">Detailed Reports</div>
              <div className="text-sm text-muted-foreground font-mono text-center">Structured intelligence analysis</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
