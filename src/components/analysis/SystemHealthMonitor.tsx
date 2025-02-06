import React from 'react';
import { Activity, Server, Cpu, AlertTriangle, CheckCircle, Minimize2, Maximize2 } from 'lucide-react';
import { SystemManager } from '@/utils/analysis/core/systemManager';

export function SystemHealthMonitor() {
  const [metrics, setMetrics] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [isMaximized, setIsMaximized] = React.useState(false);

  React.useEffect(() => {
    const systemManager = SystemManager.getInstance();
    const interval = setInterval(async () => {
      try {
        await systemManager.validateSystem();
        setMetrics(systemManager.getMetrics());
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'System health check failed');
      } finally {
        setIsLoading(false);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg flex items-center gap-2 text-red-600">
        <AlertTriangle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    );
  }

  if (!metrics) return null;

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 bg-white p-2 rounded-lg shadow-lg flex items-center gap-2"
      >
        <Activity className="w-5 h-5 text-teal-600" />
        <span className="font-medium">System Health</span>
        <Maximize2 className="w-4 h-4 text-gray-400" />
      </button>
    );
  }

  return (
    <div className={`fixed ${
      isMaximized ? 'inset-4' : 'bottom-4 right-4 w-96'
    } bg-white p-6 rounded-lg shadow-lg transition-all duration-300 overflow-auto`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-semibold">System Health</h3>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="text-gray-400 hover:text-gray-600"
          >
            {isMaximized ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
          {metrics.reliability.errorRate < 5 ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          )}
          <button
            onClick={() => setIsMinimized(true)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium">
            {metrics.reliability.errorRate < 5 ? 'Healthy' : 'Degraded'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Performance Metrics */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-4 h-4 text-teal-600" />
            <h4 className="font-medium">Performance</h4>
          </div>
          <div className="space-y-3">
            <MetricRow
              label="Response Time"
              value={`${metrics.performance.responseTime.toFixed(2)}ms`}
              threshold={5000}
              current={metrics.performance.responseTime}
            />
            <MetricRow
              label="Memory Usage"
              value={`${metrics.performance.memoryUsage.toFixed(1)}%`}
              threshold={90}
              current={metrics.performance.memoryUsage}
            />
            <MetricRow
              label="CPU Usage"
              value={`${metrics.performance.cpuUsage.toFixed(1)}%`}
              threshold={80}
              current={metrics.performance.cpuUsage}
            />
          </div>
        </div>

        {/* Reliability Metrics */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-teal-600" />
            <h4 className="font-medium">Reliability</h4>
          </div>
          <div className="space-y-3">
            <MetricRow
              label="Uptime"
              value={formatUptime(metrics.reliability.uptime)}
              threshold={99.9}
              current={100}
            />
            <MetricRow
              label="Success Rate"
              value={`${metrics.reliability.successRate.toFixed(1)}%`}
              threshold={95}
              current={metrics.reliability.successRate}
            />
            <MetricRow
              label="Error Rate"
              value={`${metrics.reliability.errorRate.toFixed(1)}%`}
              threshold={5}
              current={metrics.reliability.errorRate}
              inverse
            />
          </div>
        </div>

        {/* Feature Health */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-teal-600" />
            <h4 className="font-medium">Features</h4>
          </div>
          <div className="space-y-2">
            {Object.entries(metrics.features.health).map(([feature, health]) => (
              <div key={feature} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {feature.replace(/_/g, ' ')}
                </span>
                <HealthIndicator status={health as string} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricRow({
  label,
  value,
  threshold,
  current,
  inverse = false
}: {
  label: string;
  value: string;
  threshold: number;
  current: number;
  inverse?: boolean;
}) {
  const isGood = inverse 
    ? current <= threshold
    : current >= threshold;

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`font-medium ${
        isGood ? 'text-green-600' : 'text-red-600'
      }`}>
        {value}
      </span>
    </div>
  );
}

function HealthIndicator({ status }: { status: string }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
      <span className="text-sm font-medium capitalize">{status}</span>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}