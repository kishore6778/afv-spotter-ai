import { Shield } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative py-20 overflow-hidden">
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
            <Shield className="w-6 h-6 text-tactical-amber" />
            <span className="text-tactical-amber font-mono text-sm tracking-wider">CLASSIFIED: TOP SECRET</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight">
            AI-BASED AUTOMATED<br />
            <span className="text-tactical-amber">TARGET DETECTION</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl font-mono">
            Advanced threat detection system for Armoured Fighting Vehicles (AFVs)
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-4xl">
            <div className="bg-card border border-border p-6 rounded">
              <div className="text-3xl font-bold text-tactical-amber mb-2">99.2%</div>
              <div className="text-sm text-muted-foreground font-mono">Detection Accuracy</div>
            </div>
            <div className="bg-card border border-border p-6 rounded">
              <div className="text-3xl font-bold text-tactical-amber mb-2">&lt;0.3s</div>
              <div className="text-sm text-muted-foreground font-mono">Response Time</div>
            </div>
            <div className="bg-card border border-border p-6 rounded">
              <div className="text-3xl font-bold text-tactical-amber mb-2">24/7</div>
              <div className="text-sm text-muted-foreground font-mono">Operational Status</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
