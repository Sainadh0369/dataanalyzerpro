import React from 'react';
import { Bell, AlertTriangle, TrendingDown, Target, X, ExternalLink } from 'lucide-react';
import { DataField } from '@/types/data';
import { calculateFieldStats } from '@/utils/analysis/statistics/calculations';
import { determineTrend } from '@/utils/analysis/statistics/trends';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: Date;
  read?: boolean;
}

interface AlertSystemProps {
  data: {
    fields: DataField[];
  };
  thresholds?: Record<string, number>;
}

export function AlertSystem({ data, thresholds = {} }: AlertSystemProps) {
  const [alerts, setAlerts] = React.useState<Alert[]>([
    // Initial alert state
    {
      id: '1',
      type: 'info',
      title: 'Analysis Ready',
      message: 'Your data is ready for analysis',
      metric: 'status',
      value: 1,
      threshold: 1,
      timestamp: new Date(),
      read: false
    }
  ]);
  const [showAlerts, setShowAlerts] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [lastUpdate] = React.useState(new Date());
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    if (isInitialized || !data.fields.length || isProcessing) return;
    setIsProcessing(true);
    setIsInitialized(true);

    const newAlerts: Alert[] = [];
    const numericFields = data.fields.filter(f => f.type === 'number');

    for (const field of numericFields) {
      const values = Array.isArray(field.value) ? field.value : [field.value];
      const currentValue = values[values.length - 1];
      const stats = calculateFieldStats(field);
      const trend = determineTrend(values);

      // Check for threshold violations
      const fieldThreshold = thresholds[field.name] || stats.mean + stats.stdDev;
      if (currentValue > fieldThreshold) {
        newAlerts.push({
          id: `${field.name}-threshold-${Date.now()}`,
          type: 'critical',
          title: `Threshold Exceeded: ${field.name}`,
          message: `Value is above the defined threshold`,
          metric: field.name,
          value: currentValue,
          threshold: fieldThreshold,
          timestamp: new Date()
        });
      }

      // Check for anomalies (values outside 2 standard deviations)
      if (Math.abs(currentValue - stats.mean) > 2 * stats.stdDev) {
        newAlerts.push({
          id: `${field.name}-anomaly-${Date.now()}`,
          type: 'warning',
          title: `Anomaly Detected in ${field.name}`,
          message: `Current value deviates significantly from the normal range`,
          metric: field.name,
          value: currentValue,
          threshold: stats.mean + (2 * stats.stdDev),
          timestamp: new Date()
        });
      }
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev]);
    }
    setIsProcessing(false);
  }, [data.fields, thresholds, isInitialized, isProcessing]);

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const unreadCount = alerts.filter(alert => !alert.read).length;

  return (
    <div className="relative z-50">
      {/* Alert Bell */}
      <button
        onClick={() => setShowAlerts(!showAlerts)}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Alerts Panel */}
      {showAlerts && (
        <div className={`absolute right-0 mt-2 ${
          isExpanded ? 'w-[800px] -right-[352px]' : 'w-96'
        } bg-white rounded-lg shadow-lg border border-gray-200 z-50 transition-all duration-300`}>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Alerts & Notifications</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-400 hover:text-gray-500"
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  <ExternalLink className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowAlerts(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className={`${isExpanded ? 'max-h-[600px]' : 'max-h-[400px]'} overflow-y-auto`}>
            {alerts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No alerts to display
              </div>
            ) : (
              <div className="divide-y">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-4 ${alert.read ? 'bg-white' : 'bg-gray-50'}`}
                    onClick={() => markAsRead(alert.id)}
                  >
                    <div className="flex items-start gap-3">
                      {alert.type === 'critical' ? (
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      ) : alert.type === 'warning' ? (
                        <TrendingDown className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                      ) : (
                        <Target className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{alert.title}</h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissAlert(alert.id);
                            }}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            {alert.timestamp.toLocaleTimeString()}
                          </span>
                          <span className={`font-medium ${
                            alert.type === 'critical' ? 'text-red-600' :
                            alert.type === 'warning' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`}>
                            {alert.value.toFixed(2)} / {alert.threshold.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}