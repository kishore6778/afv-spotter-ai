import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Cpu, 
  Wifi, 
  HardDrive, 
  Shield, 
  Zap, 
  Cloud,
  CheckCircle,
  AlertCircle,
  Server,
  Brain,
  Radio,
  Settings
} from "lucide-react";

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'optimal' | 'warning' | 'critical';
  icon: React.ElementType;
}

interface ModuleStatus {
  name: string;
  version: string;
  status: 'online' | 'offline' | 'updating';
  lastUpdated: string;
}

const SystemStatus = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    { name: 'AI Processing', value: 94, unit: '%', status: 'optimal', icon: Brain },
    { name: 'Cloud Connection', value: 100, unit: '%', status: 'optimal', icon: Cloud },
    { name: 'System Memory', value: 67, unit: '%', status: 'optimal', icon: HardDrive },
    { name: 'Network Latency', value: 45, unit: 'ms', status: 'optimal', icon: Wifi },
  ]);

  const [modules, setModules] = useState<ModuleStatus[]>([
    { name: 'Object Detection Engine', version: '2.5.1', status: 'online', lastUpdated: '2024-01-15' },
    { name: 'Multi-Class Classifier', version: '1.8.0', status: 'online', lastUpdated: '2024-01-10' },
    { name: 'Object Tracking Module', version: '3.2.0', status: 'online', lastUpdated: '2024-01-12' },
    { name: 'Threat Assessment AI', version: '2.1.4', status: 'online', lastUpdated: '2024-01-14' },
    { name: 'Video Stream Processor', version: '1.5.2', status: 'online', lastUpdated: '2024-01-08' },
    { name: 'n8n Integration Layer', version: '1.0.3', status: 'online', lastUpdated: '2024-01-16' },
  ]);

  const [trainingStatus, setTrainingStatus] = useState({
    lastTraining: '2024-01-15 14:30 UTC',
    nextScheduled: '2024-01-22 14:30 UTC',
    datasetSize: 145000,
    accuracy: 99.2,
    epochsCompleted: 250,
    modelVersion: '2.5.1-stable'
  });

  const [offlineCapabilities, setOfflineCapabilities] = useState({
    localModelReady: true,
    cacheSize: '2.4 GB',
    lastSync: '2024-01-16 08:00 UTC',
    offlineDetections: 12450,
    edgeDeploymentStatus: 'Ready'
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.name === 'Network Latency' 
          ? Math.max(20, Math.min(100, metric.value + (Math.random() - 0.5) * 10))
          : Math.max(60, Math.min(100, metric.value + (Math.random() - 0.5) * 5)),
        status: metric.value > 85 ? 'optimal' : metric.value > 60 ? 'warning' : 'critical'
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
      case 'online':
        return 'text-green-500';
      case 'warning':
      case 'updating':
        return 'text-yellow-500';
      case 'critical':
      case 'offline':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* System Metrics */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-bold text-foreground font-mono mb-4 flex items-center">
          <Cpu className="w-5 h-5 mr-2 text-tactical-amber" />
          SYSTEM PERFORMANCE
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div key={metric.name} className="p-4 bg-tactical-dark rounded border border-border">
              <div className="flex items-center gap-2 mb-2">
                <metric.icon className={`w-4 h-4 ${getStatusColor(metric.status)}`} />
                <span className="text-xs text-muted-foreground font-mono">{metric.name}</span>
              </div>
              <div className="text-2xl font-bold text-foreground mb-2">
                {Math.round(metric.value)}{metric.unit}
              </div>
              <Progress 
                value={metric.name === 'Network Latency' ? 100 - metric.value : metric.value} 
                className="h-1"
              />
              <div className={`text-xs mt-1 capitalize ${getStatusColor(metric.status)}`}>
                {metric.status}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Module Status */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-bold text-foreground font-mono mb-4 flex items-center">
          <Server className="w-5 h-5 mr-2 text-tactical-amber" />
          MODULE STATUS
        </h3>
        
        <div className="grid md:grid-cols-2 gap-3">
          {modules.map((module) => (
            <div 
              key={module.name} 
              className="flex items-center justify-between p-3 bg-tactical-dark rounded border border-border"
            >
              <div className="flex items-center gap-3">
                {module.status === 'online' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className={`w-4 h-4 ${getStatusColor(module.status)}`} />
                )}
                <div>
                  <p className="text-sm text-foreground font-mono">{module.name}</p>
                  <p className="text-xs text-muted-foreground">v{module.version}</p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={`font-mono text-xs capitalize ${getStatusColor(module.status)}`}
              >
                {module.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Training Pipeline */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-bold text-foreground font-mono mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-tactical-amber" />
            TRAINING PIPELINE
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-mono">Model Version</span>
              <Badge variant="outline" className="font-mono">{trainingStatus.modelVersion}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-mono">Current Accuracy</span>
              <span className="text-sm text-green-500 font-bold">{trainingStatus.accuracy}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-mono">Dataset Size</span>
              <span className="text-sm text-foreground font-mono">{trainingStatus.datasetSize.toLocaleString()} images</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-mono">Epochs Completed</span>
              <span className="text-sm text-foreground font-mono">{trainingStatus.epochsCompleted}</span>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground font-mono">Last Training</p>
              <p className="text-sm text-foreground">{trainingStatus.lastTraining}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-mono">Next Scheduled</p>
              <p className="text-sm text-tactical-amber">{trainingStatus.nextScheduled}</p>
            </div>
          </div>
        </Card>

        {/* Offline/Edge Deployment */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-bold text-foreground font-mono mb-4 flex items-center">
            <Radio className="w-5 h-5 mr-2 text-tactical-amber" />
            EDGE DEPLOYMENT
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-mono">Local Model</span>
              <Badge variant="outline" className={offlineCapabilities.localModelReady ? 'text-green-500' : 'text-red-500'}>
                {offlineCapabilities.localModelReady ? 'Ready' : 'Not Available'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-mono">Edge Status</span>
              <Badge variant="outline" className="text-green-500 font-mono">
                {offlineCapabilities.edgeDeploymentStatus}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-mono">Cache Size</span>
              <span className="text-sm text-foreground font-mono">{offlineCapabilities.cacheSize}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-mono">Offline Detections</span>
              <span className="text-sm text-foreground font-mono">{offlineCapabilities.offlineDetections.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground font-mono">Last Sync</p>
              <p className="text-sm text-foreground">{offlineCapabilities.lastSync}</p>
            </div>
            
            <div className="p-3 bg-tactical-dark rounded border border-tactical-amber/30">
              <div className="flex items-center gap-2 text-tactical-amber">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-mono">OFFLINE CAPABLE</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                System can operate independently without cloud connectivity
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SystemStatus;
