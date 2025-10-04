import { useState } from 'react';
import { Search, Filter, ChevronDown, AlertTriangle } from 'lucide-react';
import { LogEntry } from '../types';

interface LogViewerProps {
  entries: LogEntry[];
}

export function LogViewer({ entries }: LogViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.source?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || entry.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const levels = ['all', ...Array.from(new Set(entries.map(e => e.level).filter(Boolean)))];

  const getLevelColor = (level?: string) => {
    switch (level?.toUpperCase()) {
      case 'ERROR':
      case 'FATAL':
        return 'text-red-600 bg-red-50';
      case 'WARNING':
      case 'WARN':
        return 'text-yellow-600 bg-yellow-50';
      case 'INFO':
        return 'text-blue-600 bg-blue-50';
      case 'DEBUG':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {levels.map(level => (
                <option key={level} value={level}>
                  {level === 'all' ? 'All Levels' : level}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredEntries.length} of {entries.length} entries
        </div>
      </div>

      <div className="overflow-auto" style={{ maxHeight: '600px' }}>
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No log entries found
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
              >
                <div className="flex items-start gap-3">
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 mt-1 transition-transform ${
                      expandedEntry === entry.id ? '' : '-rotate-90'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs text-gray-500">
                        #{entry.lineNumber}
                      </span>
                      {entry.level && (
                        <span className={`text-xs px-2 py-1 rounded font-medium ${getLevelColor(entry.level)}`}>
                          {entry.level}
                        </span>
                      )}
                      {entry.timestamp && (
                        <span className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      )}
                      {entry.source && (
                        <span className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                          {entry.source}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 font-mono break-all">
                      {entry.message}
                    </p>
                    {expandedEntry === entry.id && Object.keys(entry.parsedData).length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                        <div className="text-xs font-semibold text-gray-700 mb-2">
                          Parsed Data
                        </div>
                        <pre className="text-xs text-gray-600 overflow-auto">
                          {JSON.stringify(entry.parsedData, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
