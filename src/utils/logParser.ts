import { LogEntry, SecurityAlert } from '../types';

export class LogParser {
  private static readonly LOG_PATTERNS = {
    apache: /^(\S+) \S+ \S+ \[([^\]]+)\] "([^"]*)" (\d+) (\d+|-)/,
    nginx: /^(\S+) - \S+ \[([^\]]+)\] "([^"]*)" (\d+) (\d+) "([^"]*)" "([^"]*)"/,
    syslog: /^(\w+\s+\d+\s+\d+:\d+:\d+) (\S+) ([^:]+): (.*)$/,
    json: /^\{.*\}$/,
    common: /^(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)\s+(\w+)\s+(.*)$/
  };

  private static readonly SECURITY_PATTERNS = {
    sql_injection: /('|--|\bOR\b|\bAND\b|\bUNION\b|\bSELECT\b|\bDROP\b|\bINSERT\b)/i,
    xss: /(<script|javascript:|onerror=|onload=)/i,
    brute_force: /(failed|authentication|login.*failed|invalid.*password)/i,
    path_traversal: /(\.\.\/|\.\.\\)/,
    command_injection: /(\||;|`|\$\()/,
  };

  static detectLogType(content: string): string {
    const lines = content.split('\n').slice(0, 5);

    for (const line of lines) {
      if (this.LOG_PATTERNS.apache.test(line)) return 'apache';
      if (this.LOG_PATTERNS.nginx.test(line)) return 'nginx';
      if (this.LOG_PATTERNS.syslog.test(line)) return 'syslog';
      if (this.LOG_PATTERNS.json.test(line)) return 'json';
    }

    return 'generic';
  }

  static parseLog(content: string, logFileId: string, logType: string): LogEntry[] {
    const lines = content.split('\n').filter(line => line.trim());
    const entries: LogEntry[] = [];

    lines.forEach((line, index) => {
      const entry = this.parseLine(line, index + 1, logFileId, logType);
      if (entry) entries.push(entry);
    });

    return entries;
  }

  private static parseLine(line: string, lineNumber: number, logFileId: string, logType: string): LogEntry | null {
    try {
      let parsed: Partial<LogEntry> = {
        id: `${logFileId}-${lineNumber}`,
        logFileId,
        lineNumber,
        message: line,
        parsedData: {}
      };

      switch (logType) {
        case 'apache':
          parsed = this.parseApache(line, parsed);
          break;
        case 'nginx':
          parsed = this.parseNginx(line, parsed);
          break;
        case 'syslog':
          parsed = this.parseSyslog(line, parsed);
          break;
        case 'json':
          parsed = this.parseJson(line, parsed);
          break;
        default:
          parsed = this.parseCommon(line, parsed);
      }

      return parsed as LogEntry;
    } catch {
      return null;
    }
  }

  private static parseApache(line: string, entry: Partial<LogEntry>): Partial<LogEntry> {
    const match = line.match(this.LOG_PATTERNS.apache);
    if (match) {
      entry.source = match[1];
      entry.timestamp = new Date(match[2]);
      entry.parsedData = {
        request: match[3],
        status: parseInt(match[4]),
        size: match[5] === '-' ? 0 : parseInt(match[5])
      };
      entry.level = this.inferLogLevel(entry.parsedData.status);
    }
    return entry;
  }

  private static parseNginx(line: string, entry: Partial<LogEntry>): Partial<LogEntry> {
    const match = line.match(this.LOG_PATTERNS.nginx);
    if (match) {
      entry.source = match[1];
      entry.timestamp = new Date(match[2]);
      entry.parsedData = {
        request: match[3],
        status: parseInt(match[4]),
        size: parseInt(match[5]),
        referer: match[6],
        userAgent: match[7]
      };
      entry.level = this.inferLogLevel(entry.parsedData.status);
    }
    return entry;
  }

  private static parseSyslog(line: string, entry: Partial<LogEntry>): Partial<LogEntry> {
    const match = line.match(this.LOG_PATTERNS.syslog);
    if (match) {
      entry.timestamp = new Date(match[1]);
      entry.source = match[2];
      entry.parsedData = { process: match[3] };
      entry.message = match[4];
      entry.level = this.detectLevelFromMessage(match[4]);
    }
    return entry;
  }

  private static parseJson(line: string, entry: Partial<LogEntry>): Partial<LogEntry> {
    try {
      const json = JSON.parse(line);
      entry.timestamp = json.timestamp ? new Date(json.timestamp) : undefined;
      entry.level = json.level || json.severity;
      entry.source = json.source || json.host;
      entry.message = json.message || json.msg || line;
      entry.parsedData = json;
    } catch {
      // Keep original values
    }
    return entry;
  }

  private static parseCommon(line: string, entry: Partial<LogEntry>): Partial<LogEntry> {
    const match = line.match(this.LOG_PATTERNS.common);
    if (match) {
      entry.timestamp = new Date(match[1]);
      entry.level = match[2];
      entry.message = match[3];
    } else {
      entry.level = this.detectLevelFromMessage(line);
    }
    return entry;
  }

  private static inferLogLevel(statusCode: number): string {
    if (statusCode >= 500) return 'ERROR';
    if (statusCode >= 400) return 'WARNING';
    if (statusCode >= 300) return 'INFO';
    return 'INFO';
  }

  private static detectLevelFromMessage(message: string): string {
    const upperMessage = message.toUpperCase();
    if (upperMessage.includes('ERROR') || upperMessage.includes('FATAL')) return 'ERROR';
    if (upperMessage.includes('WARN')) return 'WARNING';
    if (upperMessage.includes('INFO')) return 'INFO';
    if (upperMessage.includes('DEBUG')) return 'DEBUG';
    return 'INFO';
  }

  static analyzeForSecurityThreats(entries: LogEntry[]): SecurityAlert[] {
    const alerts: SecurityAlert[] = [];

    entries.forEach(entry => {
      Object.entries(this.SECURITY_PATTERNS).forEach(([threatType, pattern]) => {
        if (pattern.test(entry.message)) {
          alerts.push({
            id: `alert-${entry.id}-${threatType}`,
            logEntryId: entry.id,
            alertType: threatType,
            severity: this.getSeverity(threatType),
            description: `Potential ${threatType.replace('_', ' ')} detected: ${entry.message.substring(0, 100)}`,
            createdAt: new Date()
          });
        }
      });
    });

    const bruteForceAttempts = this.detectBruteForce(entries);
    alerts.push(...bruteForceAttempts);

    return alerts;
  }

  private static detectBruteForce(entries: LogEntry[]): SecurityAlert[] {
    const failedAttempts = new Map<string, number>();
    const alerts: SecurityAlert[] = [];

    entries.forEach(entry => {
      if (this.SECURITY_PATTERNS.brute_force.test(entry.message) && entry.source) {
        const count = (failedAttempts.get(entry.source) || 0) + 1;
        failedAttempts.set(entry.source, count);

        if (count >= 5) {
          alerts.push({
            id: `brute-force-${entry.source}`,
            logEntryId: entry.id,
            alertType: 'brute_force_attack',
            severity: count >= 10 ? 'critical' : 'high',
            description: `${count} failed authentication attempts from ${entry.source}`,
            createdAt: new Date()
          });
        }
      }
    });

    return alerts;
  }

  private static getSeverity(threatType: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      sql_injection: 'critical',
      xss: 'high',
      brute_force: 'high',
      path_traversal: 'high',
      command_injection: 'critical',
    };
    return severityMap[threatType] || 'medium';
  }
}
