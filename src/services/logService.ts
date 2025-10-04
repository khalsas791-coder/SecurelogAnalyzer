import { supabase } from '../lib/supabase';
import { LogFile, LogEntry, SecurityAlert } from '../types';

export class LogService {
  static async createLogFile(logFile: Omit<LogFile, 'id'>): Promise<LogFile | null> {
    try {
      const { data, error } = await supabase
        .from('log_files')
        .insert({
          name: logFile.name,
          size: logFile.size,
          type: logFile.type,
          line_count: logFile.lineCount,
          status: logFile.status,
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error creating log file:', error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        size: data.size,
        type: data.type,
        uploadedAt: new Date(data.uploaded_at),
        lineCount: data.line_count,
        status: data.status,
      };
    } catch (error) {
      console.error('Error creating log file:', error);
      return null;
    }
  }

  static async updateLogFileStatus(id: string, status: LogFile['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('log_files')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Error updating log file status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating log file status:', error);
      return false;
    }
  }

  static async getAllLogFiles(): Promise<LogFile[]> {
    try {
      const { data, error } = await supabase
        .from('log_files')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error fetching log files:', error);
        return [];
      }

      return data.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(file.uploaded_at),
        lineCount: file.line_count,
        status: file.status,
      }));
    } catch (error) {
      console.error('Error fetching log files:', error);
      return [];
    }
  }

  static async createLogEntries(entries: Omit<LogEntry, 'id'>[]): Promise<boolean> {
    try {
      const batchSize = 1000;

      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);

        const { error } = await supabase
          .from('log_entries')
          .insert(
            batch.map(entry => ({
              log_file_id: entry.logFileId,
              line_number: entry.lineNumber,
              timestamp: entry.timestamp?.toISOString(),
              level: entry.level,
              source: entry.source,
              message: entry.message,
              parsed_data: entry.parsedData,
            }))
          );

        if (error) {
          console.error('Error creating log entries batch:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error creating log entries:', error);
      return false;
    }
  }

  static async getLogEntriesByFileId(logFileId: string): Promise<LogEntry[]> {
    try {
      const { data, error } = await supabase
        .from('log_entries')
        .select('*')
        .eq('log_file_id', logFileId)
        .order('line_number', { ascending: true });

      if (error) {
        console.error('Error fetching log entries:', error);
        return [];
      }

      return data.map(entry => ({
        id: entry.id,
        logFileId: entry.log_file_id,
        lineNumber: entry.line_number,
        timestamp: entry.timestamp ? new Date(entry.timestamp) : undefined,
        level: entry.level || undefined,
        source: entry.source || undefined,
        message: entry.message,
        parsedData: (entry.parsed_data as Record<string, any>) || {},
      }));
    } catch (error) {
      console.error('Error fetching log entries:', error);
      return [];
    }
  }

  static async getAllLogEntries(): Promise<LogEntry[]> {
    try {
      const { data, error } = await supabase
        .from('log_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10000);

      if (error) {
        console.error('Error fetching all log entries:', error);
        return [];
      }

      return data.map(entry => ({
        id: entry.id,
        logFileId: entry.log_file_id,
        lineNumber: entry.line_number,
        timestamp: entry.timestamp ? new Date(entry.timestamp) : undefined,
        level: entry.level || undefined,
        source: entry.source || undefined,
        message: entry.message,
        parsedData: (entry.parsed_data as Record<string, any>) || {},
      }));
    } catch (error) {
      console.error('Error fetching all log entries:', error);
      return [];
    }
  }

  static async createSecurityAlerts(alerts: Omit<SecurityAlert, 'id'>[]): Promise<boolean> {
    try {
      if (alerts.length === 0) return true;

      const { error } = await supabase
        .from('security_alerts')
        .insert(
          alerts.map(alert => ({
            log_entry_id: alert.logEntryId,
            alert_type: alert.alertType,
            severity: alert.severity,
            description: alert.description,
          }))
        );

      if (error) {
        console.error('Error creating security alerts:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creating security alerts:', error);
      return false;
    }
  }

  static async getAllSecurityAlerts(): Promise<SecurityAlert[]> {
    try {
      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching security alerts:', error);
        return [];
      }

      return data.map(alert => ({
        id: alert.id,
        logEntryId: alert.log_entry_id || undefined,
        alertType: alert.alert_type,
        severity: alert.severity,
        description: alert.description,
        createdAt: new Date(alert.created_at),
      }));
    } catch (error) {
      console.error('Error fetching security alerts:', error);
      return [];
    }
  }

  static async deleteLogFile(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('log_files')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting log file:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting log file:', error);
      return false;
    }
  }

  static async clearAllData(): Promise<boolean> {
    try {
      const { error: alertsError } = await supabase
        .from('security_alerts')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      const { error: entriesError } = await supabase
        .from('log_entries')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      const { error: filesError } = await supabase
        .from('log_files')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (alertsError || entriesError || filesError) {
        console.error('Error clearing data:', { alertsError, entriesError, filesError });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }
}
