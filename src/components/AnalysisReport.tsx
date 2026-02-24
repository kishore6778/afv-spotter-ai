import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle, MapPin, Target, ChevronRight } from "lucide-react";

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

interface AnalysisReportViewProps {
  report: AnalysisReport;
  frameCaptures: string[];
}

const AnalysisReportView = ({ report, frameCaptures }: AnalysisReportViewProps) => {
  const getThreatColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'border-destructive bg-destructive/10';
      case 'HIGH': return 'border-destructive/70 bg-destructive/5';
      case 'MEDIUM': return 'border-tactical-amber bg-tactical-amber/5';
      case 'LOW': return 'border-accent bg-accent/10';
      default: return 'border-border bg-card';
    }
  };

  const getThreatBadgeVariant = (level: string): "default" | "secondary" | "destructive" | "outline" => {
    if (level === 'CRITICAL' || level === 'HIGH') return 'destructive';
    if (level === 'MEDIUM') return 'secondary';
    return 'outline';
  };

  return (
    <section className="py-16 bg-background" id="report">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Report Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            <FileText className="inline w-8 h-8 mr-2 text-tactical-amber" />
            ANALYSIS REPORT
          </h2>
          <p className="text-muted-foreground font-mono text-sm">Detailed intelligence assessment from video analysis</p>
        </div>

        {/* Title & Summary Card */}
        <Card className={`p-6 mb-6 ${getThreatColor(report.overall_threat_level)}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h3 className="text-xl font-bold text-foreground font-mono">{report.report_title}</h3>
            <div className="flex items-center gap-3">
              <Badge variant={getThreatBadgeVariant(report.overall_threat_level)} className="font-mono text-sm px-3 py-1">
                {report.overall_threat_level} THREAT
              </Badge>
              <Badge variant="outline" className="font-mono">
                Confidence: {report.confidence_score}%
              </Badge>
            </div>
          </div>
          <p className="text-foreground leading-relaxed">{report.executive_summary}</p>
        </Card>

        {/* Findings */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-foreground font-mono mb-6 flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2 text-tactical-amber" />
            KEY FINDINGS
          </h3>

          <div className="space-y-6">
            {report.findings.map((finding, idx) => {
              const frameImg = frameCaptures[finding.frame_index] || frameCaptures[0];
              return (
                <Card key={idx} className={`overflow-hidden ${getThreatColor(finding.threat_level)}`}>
                  <div className="grid md:grid-cols-5 gap-0">
                    {/* Frame Image */}
                    <div className="md:col-span-2 relative">
                      {frameImg && (
                        <img 
                          src={frameImg} 
                          alt={`Frame for finding ${finding.finding_number}`}
                          className="w-full h-full object-cover min-h-[200px]"
                        />
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-tactical-dark/80 text-foreground font-mono text-xs">
                          Frame {finding.frame_index + 1}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Finding Details */}
                    <div className="md:col-span-3 p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="text-xs text-muted-foreground font-mono">FINDING #{finding.finding_number}</span>
                          <h4 className="text-lg font-bold text-foreground">{finding.title}</h4>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={getThreatBadgeVariant(finding.threat_level)} className="font-mono text-xs">
                            {finding.threat_level}
                          </Badge>
                          <Badge variant="outline" className="font-mono text-xs">
                            {finding.confidence}%
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-foreground leading-relaxed mb-3">{finding.description}</p>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {finding.threat_type}
                        </Badge>
                      </div>

                      <div className="mt-3 p-3 bg-tactical-dark/50 rounded border border-border">
                        <p className="text-xs text-muted-foreground font-mono mb-1">TACTICAL SIGNIFICANCE</p>
                        <p className="text-sm text-foreground">{finding.tactical_significance}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Terrain Assessment */}
        {report.terrain_assessment && (
          <Card className="p-6 mb-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground font-mono mb-3 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-tactical-amber" />
              TERRAIN ASSESSMENT
            </h3>
            <p className="text-foreground leading-relaxed">{report.terrain_assessment}</p>
          </Card>
        )}

        {/* Recommended Actions */}
        {report.recommended_actions && report.recommended_actions.length > 0 && (
          <Card className="p-6 mb-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground font-mono mb-4">RECOMMENDED ACTIONS</h3>
            <div className="space-y-3">
              {report.recommended_actions.map((action, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-tactical-dark rounded border border-border">
                  <div className="w-6 h-6 rounded-full bg-tactical-amber/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-tactical-amber font-mono">{i + 1}</span>
                  </div>
                  <p className="text-sm text-foreground">{action}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Engagement Priority */}
        {report.engagement_priority && report.engagement_priority.length > 0 && (
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground font-mono mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-tactical-amber" />
              ENGAGEMENT PRIORITY
            </h3>
            <div className="space-y-3">
              {report.engagement_priority.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-tactical-dark rounded border border-border">
                  <div className="w-8 h-8 rounded bg-tactical-amber text-tactical-dark flex items-center justify-center font-bold font-mono flex-shrink-0">
                    {item.priority}
                  </div>
                  <div>
                    <p className="font-bold text-foreground font-mono text-sm">{item.target}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.justification}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </section>
  );
};

export default AnalysisReportView;
