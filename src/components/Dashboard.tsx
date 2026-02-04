import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Shield, 
  Clock, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3,
  Cpu,
  Wifi,
  HardDrive,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import HistoryLog from "./HistoryLog";
import SystemStatus from "./SystemStatus";

interface DashboardStats {
  totalDetections: number;
  criticalThreats: number;
  avgConfidence: number;
  avgProcessingTime: number;
  recentDetections: DetectionLog[];
}

interface DetectionLog {
  id: string;
  created_at: string;
  threat_level: string;
  confidence_score: number;
  processing_time_ms: number;
  source_type: string;
  detected_objects: unknown;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalDetections: 0,
    criticalThreats: 0,
    avgConfidence: 0,
    avgProcessingTime: 0,
    recentDetections: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('detection_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'detection_logs'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      // Get all detection logs
      const { data: logs, error } = await supabase
        .from('detection_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (logs && logs.length > 0) {
        const totalDetections = logs.length;
        const criticalThreats = logs.filter(l => l.threat_level === 'critical' || l.threat_level === 'high').length;
        const avgConfidence = logs.reduce((sum, l) => sum + (Number(l.confidence_score) || 0), 0) / totalDetections;
        const avgProcessingTime = logs.reduce((sum, l) => sum + (l.processing_time_ms || 0), 0) / totalDetections;

        setStats({
          totalDetections,
          criticalThreats,
          avgConfidence: Math.round(avgConfidence * 10) / 10,
          avgProcessingTime: Math.round(avgProcessingTime),
          recentDetections: logs.slice(0, 10) as DetectionLog[]
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            <BarChart3 className="inline w-7 h-7 mr-2 text-tactical-amber" />
            OPERATIONS DASHBOARD
          </h2>
          <p className="text-muted-foreground font-mono text-sm">Real-time system metrics and detection history</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto mb-8">
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-tactical-amber/20 rounded">
                <Target className="w-5 h-5 text-tactical-amber" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalDetections}</p>
                <p className="text-xs text-muted-foreground font-mono">Total Detections</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/20 rounded">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.criticalThreats}</p>
                <p className="text-xs text-muted-foreground font-mono">Critical Threats</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.avgConfidence}%</p>
                <p className="text-xs text-muted-foreground font-mono">Avg Confidence</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.avgProcessingTime}ms</p>
                <p className="text-xs text-muted-foreground font-mono">Avg Response</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="live" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="live" className="font-mono">
              <Activity className="w-4 h-4 mr-2" />
              Live Status
            </TabsTrigger>
            <TabsTrigger value="history" className="font-mono">
              <Clock className="w-4 h-4 mr-2" />
              Detection History
            </TabsTrigger>
            <TabsTrigger value="system" className="font-mono">
              <Cpu className="w-4 h-4 mr-2" />
              System Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live">
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-bold text-foreground font-mono mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-tactical-amber" />
                RECENT DETECTIONS
              </h3>
              
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : stats.recentDetections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground font-mono">
                  <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No detections recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentDetections.map((detection) => (
                    <div 
                      key={detection.id}
                      className="flex items-center justify-between p-3 bg-tactical-dark rounded border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          detection.threat_level === 'critical' ? 'bg-red-500 animate-pulse' :
                          detection.threat_level === 'high' ? 'bg-orange-500' :
                          detection.threat_level === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`} />
                        <div>
                          <p className="text-sm text-foreground font-mono">
                            {new Date(detection.created_at).toLocaleTimeString()}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {detection.source_type.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono text-xs">
                          {detection.confidence_score?.toFixed(1)}%
                        </Badge>
                        <Badge variant="outline" className={`font-mono text-xs capitalize ${getThreatColor(detection.threat_level)}`}>
                          {detection.threat_level}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {detection.processing_time_ms}ms
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <HistoryLog />
          </TabsContent>

          <TabsContent value="system">
            <SystemStatus />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default Dashboard;
