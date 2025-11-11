import { Shield, Zap, Eye, Database, Cpu, Network, Lock, Target } from "lucide-react";
import { Card } from "@/components/ui/card";

const Documentation = () => {
  return (
    <div className="min-h-screen bg-background p-8 print:p-0">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 border-b border-border pb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-tactical-amber" />
            <h1 className="text-4xl font-bold text-foreground">
              AI-Based Automated Target Detection for AFVs
            </h1>
          </div>
          <p className="text-xl text-muted-foreground font-mono">
            Advanced Military AI System | Real-Time Threat Detection
          </p>
          <p className="text-sm text-muted-foreground">
            Army Design Bureau | Classified System Documentation
          </p>
        </div>

        {/* Executive Summary */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-tactical-amber" />
            Executive Summary
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            This project presents an advanced AI-powered target detection system specifically designed for 
            Armoured Fighting Vehicles (AFVs). The system utilizes cutting-edge computer vision and machine 
            learning technologies to identify potential threats in tactical environments, including camouflaged 
            personnel, military vehicles, concealed positions, and fortifications. The solution provides real-time 
            analysis with sub-second response times, enabling rapid threat assessment and engagement decisions.
          </p>
        </Card>

        {/* Technology Stack */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-tactical-amber" />
            Technology Stack
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold text-foreground mb-2 font-mono">Frontend</h3>
              <ul className="space-y-1 text-muted-foreground text-sm">
                <li>• React 18.3.1 - UI Framework</li>
                <li>• TypeScript - Type Safety</li>
                <li>• Vite - Build Tool</li>
                <li>• Tailwind CSS - Styling</li>
                <li>• Shadcn UI - Component Library</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-2 font-mono">Backend & AI</h3>
              <ul className="space-y-1 text-muted-foreground text-sm">
                <li>• Lovable Cloud (Supabase) - Backend Infrastructure</li>
                <li>• Google Gemini 2.5 Flash - AI Vision Model</li>
                <li>• Edge Functions - Serverless Processing</li>
                <li>• n8n Integration - Workflow Automation</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* System Architecture */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Network className="w-6 h-6 text-tactical-amber" />
            System Architecture
          </h2>
          <div className="space-y-4 text-muted-foreground">
            <div>
              <h3 className="font-bold text-foreground mb-2 font-mono">1. Image Acquisition Layer</h3>
              <p className="text-sm">
                Supports multiple input methods: file upload and real-time webcam capture. Images are 
                processed in base64 format for seamless transmission to the AI analysis engine.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-2 font-mono">2. AI Processing Layer</h3>
              <p className="text-sm">
                Utilizes Google's Gemini 2.5 Flash model via Lovable AI Gateway for advanced computer vision 
                analysis. The model is specifically prompted for military target detection with focus on:
              </p>
              <ul className="text-sm ml-4 mt-2 space-y-1">
                <li>• Camouflaged personnel and equipment detection</li>
                <li>• Military vehicle identification</li>
                <li>• Concealed position recognition</li>
                <li>• Threat level assessment</li>
                <li>• Tactical recommendation generation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-2 font-mono">3. Integration Layer</h3>
              <p className="text-sm">
                Optional n8n webhook integration enables automated workflow triggers, allowing the system 
                to connect with broader military information systems, alert mechanisms, and command chains.
              </p>
            </div>
          </div>
        </Card>

        {/* Key Features */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-tactical-amber" />
            Key Features & Capabilities
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-tactical-amber mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground font-mono text-sm">Advanced Detection</h4>
                  <p className="text-xs text-muted-foreground">
                    AI-powered vision capable of detecting camouflaged targets in complex environments
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-tactical-amber mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground font-mono text-sm">Real-Time Processing</h4>
                  <p className="text-xs text-muted-foreground">
                    Sub-second response time for rapid threat assessment and engagement decisions
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-tactical-amber mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground font-mono text-sm">Extensive Training</h4>
                  <p className="text-xs text-muted-foreground">
                    Trained on large datasets of tactical scenarios for maximum accuracy
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-tactical-amber mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground font-mono text-sm">Secure Architecture</h4>
                  <p className="text-xs text-muted-foreground">
                    Backend processing with API key security and CORS protection
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Implementation Details */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4 font-mono">
            Technical Implementation
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-foreground mb-2 font-mono text-sm">AI Analysis Endpoint</h3>
              <p className="text-xs text-muted-foreground mb-2">
                Edge function: <code className="bg-tactical-dark px-2 py-1 rounded">analyze-target</code>
              </p>
              <p className="text-sm text-muted-foreground">
                Serverless function that processes images through the AI gateway, handles rate limiting (429), 
                payment validation (402), and returns structured analysis with confidence scores, location 
                descriptions, threat assessments, and recommended actions.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-2 font-mono text-sm">Output Format</h3>
              <div className="bg-tactical-dark p-3 rounded text-xs font-mono text-muted-foreground">
                <pre>{`{
  "analysis": "Detailed text analysis including:
    1. Detected objects/targets with confidence scores
    2. Location descriptions
    3. Threat assessment
    4. Recommended actions"
}`}</pre>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-2 font-mono text-sm">n8n Webhook Payload</h3>
              <div className="bg-tactical-dark p-3 rounded text-xs font-mono text-muted-foreground">
                <pre>{`{
  "timestamp": "ISO 8601 datetime",
  "analysis": "Full AI analysis text",
  "image": "Truncated base64 image data"
}`}</pre>
              </div>
            </div>
          </div>
        </Card>

        {/* Use Cases */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4 font-mono">
            Military Use Cases
          </h2>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li>• <strong>Reconnaissance Missions:</strong> Automated analysis of surveillance imagery</li>
            <li>• <strong>Urban Combat:</strong> Detection of concealed threats in complex environments</li>
            <li>• <strong>Convoy Protection:</strong> Real-time threat scanning during movement</li>
            <li>• <strong>Border Security:</strong> Automated monitoring of restricted areas</li>
            <li>• <strong>Training Simulations:</strong> AI-assisted tactical training scenarios</li>
          </ul>
        </Card>

        {/* Future Enhancements */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4 font-mono">
            Future Enhancements
          </h2>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li>• Multi-spectral imaging support (infrared, thermal)</li>
            <li>• Historical tracking and pattern recognition</li>
            <li>• Integration with weapon systems for automated response</li>
            <li>• Drone and aerial platform support</li>
            <li>• Advanced threat classification and friend-or-foe identification</li>
            <li>• Offline processing capability for field deployment</li>
          </ul>
        </Card>

        {/* Conclusion */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4 font-mono">
            Conclusion
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            This AI-Based Automated Target Detection system represents a significant advancement in military 
            technology, combining cutting-edge artificial intelligence with practical battlefield applications. 
            The system's ability to rapidly identify and assess threats in complex tactical environments provides 
            a critical advantage for AFV operations, enhancing crew safety and mission effectiveness. The modular 
            architecture and integration capabilities ensure the system can evolve with emerging technologies and 
            adapt to changing operational requirements.
          </p>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground font-mono pt-8 border-t border-border print:mt-8">
          <p>ARMY DESIGN BUREAU | CLASSIFIED SYSTEM | AUTHORIZED PERSONNEL ONLY</p>
          <p className="mt-2">Document Generated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { 
            background: white !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:mt-8 {
            margin-top: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Documentation;