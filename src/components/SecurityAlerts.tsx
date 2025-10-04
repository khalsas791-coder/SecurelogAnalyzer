import { AlertTriangle, Shield, AlertCircle, XCircle } from 'lucide-react';
import { SecurityAlert } from '../types';

interface SecurityAlertsProps {
  alerts: SecurityAlert[];
}

export function SecurityAlerts({ alerts }: SecurityAlertsProps) {
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          color: 'bg-red-100 border-red-300 text-red-800',
          icon: XCircle,
          iconColor: 'text-red-600'
        };
      case 'high':
        return {
          color: 'bg-orange-100 border-orange-300 text-orange-800',
          icon: AlertTriangle,
          iconColor: 'text-orange-600'
        };
      case 'medium':
        return {
          color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
          icon: AlertCircle,
          iconColor: 'text-yellow-600'
        };
      case 'low':
        return {
          color: 'bg-blue-100 border-blue-300 text-blue-800',
          icon: Shield,
          iconColor: 'text-blue-600'
        };
      default:
        return {
          color: 'bg-gray-100 border-gray-300 text-gray-800',
          icon: AlertCircle,
          iconColor: 'text-gray-600'
        };
    }
  };

  const groupedAlerts = alerts.reduce((acc, alert) => {
    if (!acc[alert.severity]) {
      acc[alert.severity] = [];
    }
    acc[alert.severity].push(alert);
    return acc;
  }, {} as Record<string, SecurityAlert[]>);

  const severityOrder: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low'];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-semibold text-gray-900">Security Alerts</h2>
          <span className="ml-auto text-sm font-medium text-gray-600">
            {alerts.length} total
          </span>
        </div>
      </div>

      <div className="p-4">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p className="text-gray-600">No security threats detected</p>
            <p className="text-sm text-gray-500 mt-1">Your logs appear clean</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {severityOrder.map(severity => {
                const count = groupedAlerts[severity]?.length || 0;
                const config = getSeverityConfig(severity);
                const Icon = config.icon;

                return (
                  <div key={severity} className={`p-4 rounded-lg border-2 ${config.color}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${config.iconColor}`} />
                      <span className="text-xs font-semibold uppercase">{severity}</span>
                    </div>
                    <div className="text-2xl font-bold">{count}</div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              {severityOrder.map(severity => {
                const severityAlerts = groupedAlerts[severity];
                if (!severityAlerts || severityAlerts.length === 0) return null;

                const config = getSeverityConfig(severity);
                const Icon = config.icon;

                return (
                  <div key={severity}>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 capitalize">
                      {severity} Priority
                    </h3>
                    <div className="space-y-2">
                      {severityAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-3 rounded-lg border ${config.color}`}
                        >
                          <div className="flex items-start gap-3">
                            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">
                                  {alert.alertType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                                <span className="text-xs opacity-75">
                                  {new Date(alert.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-sm break-words">{alert.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
