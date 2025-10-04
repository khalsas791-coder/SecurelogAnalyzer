export interface LogFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  lineCount: number;
  status: 'uploaded' | 'parsing' | 'parsed' | 'error';
}

export interface LogEntry {
  id: string;
  logFileId: string;
  lineNumber: number;
  timestamp?: Date;
  level?: string;
  source?: string;
  message: string;
  parsedData: Record<string, any>;
}

export interface SecurityAlert {
  id: string;
  logEntryId?: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  createdAt: Date;
}

export interface AnalysisSession {
  id: string;
  name: string;
  createdAt: Date;
  lastAccessed: Date;
}
