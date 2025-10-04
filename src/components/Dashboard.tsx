import { LogFile, LogEntry } from '../types';
import { FileText, Database, Activity, Clock } from 'lucide-react';

interface DashboardProps {
  logFiles: LogFile[];
  entries: LogEntry[];
}

export function Dashboard({ logFiles, entries }: DashboardProps) {
  const totalSize = logFiles.reduce((sum, file) => sum + file.size, 0);
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const errorCount = entries.filter(e =>
    e.level?.toUpperCase() === 'ERROR' || e.level?.toUpperCase() === 'FATAL'
  ).length;

  const warningCount = entries.filter(e =>
    e.level?.toUpperCase() === 'WARNING' || e.level?.toUpperCase() === 'WARN'
  ).length;

  const stats = [
    {
      label: 'Log Files',
      value: logFiles.length,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Total Entries',
      value: entries.length.toLocaleString(),
      icon: Database,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Errors',
      value: errorCount,
      icon: Activity,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      label: 'Warnings',
      value: warningCount,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {logFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Loaded Files</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {logFiles.map((file) => (
              <div key={file.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatBytes(file.size)} • {file.lineCount.toLocaleString()} lines • {file.type}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    file.status === 'parsed' ? 'bg-green-100 text-green-800' :
                    file.status === 'parsing' ? 'bg-blue-100 text-blue-800' :
                    file.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {file.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
