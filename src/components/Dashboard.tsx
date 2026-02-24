import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, Target, AlertTriangle, Clock, CheckCircle,
  Activity, Eye, Download, Trash2, ChevronLeft, ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface DetectionLog {
  id: string;
  created_at: string;
  analysis_result: string;
  threat_level: string;
  confidence_score: number;
  processing_time_ms: number;
  source_type: string;
  detected_objects: unknown;
  metadata: unknown;
}

const Dashboard = () => {
  const [logs, setLogs] = useState<DetectionLog[]>([]);
  const [stats, setStats] = useState({ total: 0, critical: 0, avgConf: 0, avgTime: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<DetectionLog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();
  const pageSize = 8;

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('dashboard_updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'detection_logs' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentPage]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data, error, count } = await supabase
        .from('detection_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      if (error) throw error;

      const allLogs = data as DetectionLog[] || [];
      setLogs(allLogs);
      setTotalCount(count || 0);

      // Fetch stats from all records
      const { data: allData } = await supabase.from('detection_logs').select('threat_level, confidence_score, processing_time_ms');
      if (allData) {
        const total = allData.length;
        const critical = allData.filter(l => l.threat_level === 'critical' || l.threat_level === 'high').length;
        const avgConf = total > 0 ? allData.reduce((s, l) => s + (Number(l.confidence_score) || 0), 0) / total : 0;
        const avgTime = total > 0 ? allData.reduce((s, l) => s + (l.processing_time_ms || 0), 0) / total : 0;
        setStats({ total, critical, avgConf: Math.round(avgConf * 10) / 10, avgTime: Math.round(avgTime) });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLog = async (id: string) => {
    try {
      await supabase.from('detection_logs').delete().eq('id', id);
      toast({ title: "Deleted", description: "Log removed." });
      fetchData();
    } catch { toast({ title: "Error", description: "Failed to delete.", variant: "destructive" }); }
  };

  const exportLogs = () => {
    const csv = "Timestamp,Threat,Confidence,Source\n" + logs.map(l => 
      `${l.created_at},${l.threat_level},${l.confidence_score},${l.source_type}`
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `detection_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getThreatBadge = (level: string): "default" | "secondary" | "destructive" | "outline" => {
    if (level === 'critical' || level === 'high') return 'destructive';
    if (level === 'medium') return 'secondary';
    return 'outline';
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <section className="py-16 bg-background" id="dashboard">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            <BarChart3 className="inline w-8 h-8 mr-2 text-tactical-amber" />
            OPERATIONS DASHBOARD
          </h2>
          <p className="text-muted-foreground font-mono">Detection history and performance metrics</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-tactical-amber/20 rounded"><Target className="w-5 h-5 text-tactical-amber" /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground font-mono">Total Analyses</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/20 rounded"><AlertTriangle className="w-5 h-5 text-destructive" /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.critical}</p>
                <p className="text-xs text-muted-foreground font-mono">High/Critical</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/30 rounded"><CheckCircle className="w-5 h-5 text-accent-foreground" /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.avgConf}%</p>
                <p className="text-xs text-muted-foreground font-mono">Avg Confidence</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded"><Clock className="w-5 h-5 text-secondary-foreground" /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.avgTime}ms</p>
                <p className="text-xs text-muted-foreground font-mono">Avg Processing</p>
              </div>
            </div>
          </Card>
        </div>

        {/* History Table */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground font-mono flex items-center">
              <Activity className="w-5 h-5 mr-2 text-tactical-amber" />
              DETECTION HISTORY
            </h3>
            <Button variant="outline" size="sm" onClick={exportLogs}>
              <Download className="w-4 h-4 mr-1" /> Export CSV
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground font-mono">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-mono">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No analyses recorded yet. Upload a video to begin.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-xs font-mono text-muted-foreground">TIME</th>
                      <th className="text-left py-2 px-3 text-xs font-mono text-muted-foreground">SOURCE</th>
                      <th className="text-left py-2 px-3 text-xs font-mono text-muted-foreground">THREAT</th>
                      <th className="text-left py-2 px-3 text-xs font-mono text-muted-foreground">CONFIDENCE</th>
                      <th className="text-right py-2 px-3 text-xs font-mono text-muted-foreground">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-border/50 hover:bg-tactical-dark/50">
                        <td className="py-3 px-3 text-sm font-mono text-foreground">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className="font-mono text-xs capitalize">{log.source_type}</Badge>
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant={getThreatBadge(log.threat_level)} className="font-mono text-xs capitalize">{log.threat_level}</Badge>
                        </td>
                        <td className="py-3 px-3 text-sm font-mono text-foreground">{log.confidence_score?.toFixed(1)}%</td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteLog(log.id)} className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground font-mono">
                  Page {currentPage} of {totalPages || 1} ({totalCount} total)
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Detail Dialog */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-mono">Detection Details</DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">Timestamp</p>
                    <p className="text-sm text-foreground">{new Date(selectedLog.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">Threat Level</p>
                    <Badge variant={getThreatBadge(selectedLog.threat_level)} className="capitalize">{selectedLog.threat_level}</Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-mono mb-2">Analysis Result</p>
                  <div className="bg-tactical-dark p-4 rounded border border-border max-h-60 overflow-y-auto">
                    <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">{selectedLog.analysis_result}</pre>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default Dashboard;
