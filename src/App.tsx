import { useState, useEffect } from 'react';
import { Shield, BarChart3, FileSearch, Home } from 'lucide-react';
import { LogFile, LogEntry, SecurityAlert } from './types';
import { LogParser } from './utils/logParser';
import { LogService } from './services/logService';
import { FileUpload } from './components/FileUpload';
import { LogViewer } from './components/LogViewer';
import { SecurityAlerts } from './components/SecurityAlerts';
import { Dashboard } from './components/Dashboard';

type Tab = 'dashboard' | 'logs' | 'security' | 'analysis';

function App() {
  const [logFiles, setLogFiles] = useState<LogFile[]>([]);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDataFromDatabase();
  }, []);

  const loadDataFromDatabase = async () => {
    setIsLoading(true);
    try {
      const [files, entries, alerts] = await Promise.all([
        LogService.getAllLogFiles(),
        LogService.getAllLogEntries(),
        LogService.getAllSecurityAlerts(),
      ]);

      setLogFiles(files);
      setLogEntries(entries);
      setSecurityAlerts(alerts);
    } catch (error) {
      console.error('Error loading data from database:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);

    try {
      const content = await file.text();
      const logType = LogParser.detectLogType(content);
      const lineCount = content.split('\n').filter(line => line.trim()).length;

      const newLogFile = await LogService.createLogFile({
        name: file.name,
        size: file.size,
        type: logType,
        uploadedAt: new Date(),
        lineCount,
        status: 'parsing'
      });

      if (!newLogFile) {
        throw new Error('Failed to create log file in database');
      }

      setLogFiles(prev => [...prev, newLogFile]);

      const entries = LogParser.parseLog(content, newLogFile.id, logType);

      const success = await LogService.createLogEntries(
        entries.map(({ id, ...entry }) => entry)
      );

      if (success) {
        const savedEntries = await LogService.getLogEntriesByFileId(newLogFile.id);
        setLogEntries(prev => [...prev, ...savedEntries]);

        const alerts = LogParser.analyzeForSecurityThreats(savedEntries);

        if (alerts.length > 0) {
          await LogService.createSecurityAlerts(
            alerts.map(({ id, ...alert }) => alert)
          );
          const savedAlerts = await LogService.getAllSecurityAlerts();
          setSecurityAlerts(savedAlerts);
        }

        await LogService.updateLogFileStatus(newLogFile.id, 'parsed');
        setLogFiles(prev =>
          prev.map(f => f.id === newLogFile.id ? { ...f, status: 'parsed' } : f)
        );
      } else {
        await LogService.updateLogFileStatus(newLogFile.id, 'error');
        setLogFiles(prev =>
          prev.map(f => f.id === newLogFile.id ? { ...f, status: 'error' } : f)
        );
      }

      setActiveTab('dashboard');
    } catch (error) {
      console.error('Error processing log file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: Home },
    { id: 'logs' as Tab, label: 'Log Viewer', icon: FileSearch },
    { id: 'security' as Tab, label: 'Security', icon: Shield },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SecureLog Analyzer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 rounded-lg shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SecureLog Analyzer</h1>
                <p className="text-sm text-gray-600">Security-focused log analysis tool</p>
              </div>
            </div>
            {isProcessing && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium">Processing...</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <nav className="flex gap-2 bg-white rounded-lg shadow p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'security' && securityAlerts.length > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {securityAlerts.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-6">
          {logFiles.length === 0 ? (
            <div className="max-w-2xl mx-auto">
              <FileUpload onFileUpload={handleFileUpload} />
              <div className="mt-8 bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileSearch className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Multi-format Support</h4>
                      <p className="text-sm text-gray-600">Apache, Nginx, Syslog, JSON, and more</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Security Analysis</h4>
                      <p className="text-sm text-gray-600">Detect threats and anomalies</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Real-time Parsing</h4>
                      <p className="text-sm text-gray-600">Instant analysis and insights</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <FileSearch className="w-5 h-5 text-orange-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Advanced Search</h4>
                      <p className="text-sm text-gray-600">Filter and search through logs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <FileUpload onFileUpload={handleFileUpload} />
              </div>

              {activeTab === 'dashboard' && (
                <Dashboard logFiles={logFiles} entries={logEntries} />
              )}

              {activeTab === 'logs' && (
                <LogViewer entries={logEntries} />
              )}

              {activeTab === 'security' && (
                <SecurityAlerts alerts={securityAlerts} />
              )}
            </>
          )}
        </div>
      </div>

      <footer className="mt-12 pb-6 text-center text-sm text-gray-500">
        <p>SecureLog Analyzer - Portable & Offline Log Analysis Tool</p>
      </footer>
    </div>
  );
}

export default App;
