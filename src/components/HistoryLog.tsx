import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  History, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Download,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface DetectionLog {
  id: string;
  session_id: string;
  created_at: string;
  analysis_result: string;
  threat_level: string;
  confidence_score: number;
  processing_time_ms: number;
  source_type: string;
  detected_objects: unknown;
  metadata: unknown;
}

const HistoryLog = () => {
  const [logs, setLogs] = useState<DetectionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [threatFilter, setThreatFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedLog, setSelectedLog] = useState<DetectionLog | null>(null);
  const { toast } = useToast();
  
  const pageSize = 10;

  useEffect(() => {
    fetchLogs();
  }, [currentPage, threatFilter, sourceFilter]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('detection_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (threatFilter !== 'all') {
        query = query.eq('threat_level', threatFilter);
      }
      
      if (sourceFilter !== 'all') {
        query = query.eq('source_type', sourceFilter);
      }

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setLogs(data as DetectionLog[] || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch detection history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('detection_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Detection log removed successfully",
      });
      
      fetchLogs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete log",
        variant: "destructive",
      });
    }
  };

  const exportLogs = () => {
    const csvContent = logs.map(log => 
      `${log.created_at},${log.threat_level},${log.confidence_score},${log.processing_time_ms},${log.source_type}`
    ).join('\n');
    
    const header = "Timestamp,Threat Level,Confidence,Processing Time (ms),Source\n";
    const blob = new Blob([header + csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `detection_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(log => 
    log.analysis_result?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.threat_level?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / pageSize);

  const getThreatBadgeVariant = (level: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-bold text-foreground font-mono flex items-center">
          <History className="w-5 h-5 mr-2 text-tactical-amber" />
          DETECTION HISTORY
        </h3>
        
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-40 font-mono text-sm"
            />
          </div>
          
          <Select value={threatFilter} onValueChange={setThreatFilter}>
            <SelectTrigger className="w-32 font-mono text-sm">
              <Filter className="w-4 h-4 mr-1" />
              <SelectValue placeholder="Threat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Threats</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-32 font-mono text-sm">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video_stream">Video</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={exportLogs}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading history...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground font-mono">
          <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No detection logs found</p>
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
                  <th className="text-left py-2 px-3 text-xs font-mono text-muted-foreground">RESPONSE</th>
                  <th className="text-right py-2 px-3 text-xs font-mono text-muted-foreground">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-tactical-dark/50">
                    <td className="py-3 px-3 text-sm font-mono text-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className="font-mono text-xs capitalize">
                        {log.source_type.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={getThreatBadgeVariant(log.threat_level)} className="font-mono text-xs capitalize">
                        {log.threat_level}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-sm font-mono text-foreground">
                      {log.confidence_score?.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-sm font-mono text-muted-foreground">
                      {log.processing_time_ms}ms
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteLog(log.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground font-mono">
              Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-3 py-1 text-sm font-mono">
                {currentPage} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}

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
                  <p className="text-xs text-muted-foreground font-mono">Session ID</p>
                  <p className="text-sm text-foreground font-mono">{selectedLog.session_id.slice(0, 8)}...</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-mono">Threat Level</p>
                  <Badge variant={getThreatBadgeVariant(selectedLog.threat_level)} className="capitalize">
                    {selectedLog.threat_level}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-mono">Processing Time</p>
                  <p className="text-sm text-foreground">{selectedLog.processing_time_ms}ms</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground font-mono mb-2">Analysis Result</p>
                <div className="bg-tactical-dark p-4 rounded border border-border max-h-60 overflow-y-auto">
                  <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">
                    {selectedLog.analysis_result}
                  </pre>
                </div>
              </div>

              {selectedLog.detected_objects && (
                <div>
                  <p className="text-xs text-muted-foreground font-mono mb-2">Detected Objects</p>
                  <div className="bg-tactical-dark p-4 rounded border border-border">
                    <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">
                      {JSON.stringify(selectedLog.detected_objects, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default HistoryLog;
