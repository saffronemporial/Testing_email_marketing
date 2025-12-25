// FILE 12: AutomationLogger.js
import supabaseClient from '../../supabaseClient';


export class AutomationLogger {
  constructor() {
    this.supabase = supabaseClient;
    this.batchSize = 50;
    this.logQueue = [];
  }

  /**
   * Log automation execution with detailed tracking
   */
  async logAutomationExecution(logData) {
    try {
      const {
        automation_id,
        automation_name,
        profile_id,
        trigger_type,
        trigger_data,
        conditions_evaluated,
        actions_executed,
        status,
        error_message,
        execution_time,
        metadata = {}
      } = logData;

      const logEntry = {
        automation_id,
        automation_name,
        profile_id,
        trigger_type,
        trigger_data,
        conditions_evaluated,
        actions_executed,
        status,
        error_message,
        execution_time,
        metadata,
        created_at: new Date().toISOString()
      };

      // Add to queue for batch processing
      this.logQueue.push(logEntry);

      // If queue reaches batch size, flush immediately
      if (this.logQueue.length >= this.batchSize) {
        await this.flushLogQueue();
      }

      return logEntry;

    } catch (error) {
      console.error('Error logging automation execution:', error);
      // Fallback: log to console
      console.log('Automation Log (Fallback):', logData);
    }
  }

  /**
   * Flush log queue to database
   */
  async flushLogQueue() {
    if (this.logQueue.length === 0) return;

    try {
      const logsToInsert = [...this.logQueue];
      this.logQueue = [];

      const { error } = await this.supabase
        .from('automation_logs')
        .insert(logsToInsert);

      if (error) throw error;

      console.log(`Successfully logged ${logsToInsert.length} automation executions`);

    } catch (error) {
      console.error('Error flushing log queue:', error);
      // Re-add logs to queue for retry
      this.logQueue.unshift(...logsToInsert);
    }
  }

  /**
   * Get automation logs with filtering and pagination
   */
  async getAutomationLogs(filters = {}, page = 1, pageSize = 50) {
    try {
      let query = this.supabase
        .from('automation_logs')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.automation_id) {
        query = query.eq('automation_id', filters.automation_id);
      }
      if (filters.profile_id) {
        query = query.eq('profile_id', filters.profile_id);
      }
      if (filters.trigger_type) {
        query = query.eq('trigger_type', filters.trigger_type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }
      if (filters.search) {
        query = query.or(`automation_name.ilike.%${filters.search}%,error_message.ilike.%${filters.search}%`);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data: logs, error, count } = await query;

      if (error) throw error;

      return {
        logs: logs || [],
        total_count: count || 0,
        current_page: page,
        total_pages: Math.ceil((count || 0) / pageSize),
        page_size: pageSize
      };

    } catch (error) {
      console.error('Error getting automation logs:', error);
      throw error;
    }
  }

  /**
   * Get automation performance statistics
   */
  async getAutomationStatistics(dateRange = '7d') {
    try {
      const dateFilter = this.getDateFilter(dateRange);

      // Get total executions
      const { data: totalData, error: totalError } = await this.supabase
        .from('automation_logs')
        .select('id', { count: 'exact' })
        .gte('created_at', dateFilter);

      if (totalError) throw totalError;

      // Get status breakdown
      const { data: statusData, error: statusError } = await this.supabase
        .from('automation_logs')
        .select('status')
        .gte('created_at', dateFilter);

      if (statusError) throw statusError;

      // Get top automations
      const { data: topAutomations, error: topError } = await this.supabase
        .from('automation_logs')
        .select('automation_name, automation_id')
        .gte('created_at', dateFilter)
        .group('automation_name, automation_id')
        .select('count');

      if (topError) throw topError;

      // Calculate statistics
      const statusCount = {};
      statusData.forEach(log => {
        statusCount[log.status] = (statusCount[log.status] || 0) + 1;
      });

      const totalExecutions = totalData.length;
      const successRate = totalExecutions > 0 ? 
        ((statusCount.success || 0) / totalExecutions) * 100 : 0;

      return {
        total_executions: totalExecutions,
        success_rate: Math.round(successRate * 100) / 100,
        status_breakdown: statusCount,
        top_automations: topAutomations
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        date_range: dateRange,
        calculated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting automation statistics:', error);
      throw error;
    }
  }

  /**
   * Get date filter for statistics
   */
  getDateFilter(dateRange) {
    const now = new Date();
    const filterDate = new Date();

    switch (dateRange) {
      case '24h':
        filterDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        filterDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        filterDate.setDate(now.getDate() - 90);
        break;
      default:
        filterDate.setDate(now.getDate() - 7);
    }

    return filterDate.toISOString();
  }

  /**
   * Log communication activity
   */
  async logCommunication(commData) {
    try {
      const {
        profile_id,
        client_id,
        channel,
        direction,
        content,
        external_id,
        status,
        error_message,
        automation_id,
        metadata = {}
      } = commData;

      const { data, error } = await this.supabase
        .from('communication_logs')
        .insert({
          profile_id,
          client_id,
          channel,
          direction,
          content,
          external_id,
          status,
          error_message,
          automation_id,
          metadata,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('Error logging communication:', error);
      throw error;
    }
  }

  /**
   * Get communication logs with filtering
   */
  async getCommunicationLogs(filters = {}, page = 1, pageSize = 50) {
    try {
      let query = this.supabase
        .from('communication_logs')
        .select(`
          *,
          profiles:profile_id (full_name, email, phone),
          clients:client_id (company_name, business_type)
        `, { count: 'exact' });

      // Apply filters
      if (filters.profile_id) {
        query = query.eq('profile_id', filters.profile_id);
      }
      if (filters.client_id) {
        query = query.eq('client_id', filters.client_id);
      }
      if (filters.channel) {
        query = query.eq('channel', filters.channel);
      }
      if (filters.direction) {
        query = query.eq('direction', filters.direction);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }
      if (filters.search) {
        query = query.or(`content.ilike.%${filters.search}%,external_id.ilike.%${filters.search}%`);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data: logs, error, count } = await query;

      if (error) throw error;

      return {
        logs: logs || [],
        total_count: count || 0,
        current_page: page,
        total_pages: Math.ceil((count || 0) / pageSize),
        page_size: pageSize
      };

    } catch (error) {
      console.error('Error getting communication logs:', error);
      throw error;
    }
  }

  /**
   * Clean up old logs (retention policy)
   */
  async cleanupOldLogs(retentionDays = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const { error: automationError } = await this.supabase
        .from('automation_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (automationError) throw automationError;

      const { error: commError } = await this.supabase
        .from('communication_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (commError) throw commError;

      return {
        deleted_automation_logs: 'all older than ' + retentionDays + ' days',
        deleted_communication_logs: 'all older than ' + retentionDays + ' days',
        cutoff_date: cutoffDate.toISOString()
      };

    } catch (error) {
      console.error('Error cleaning up old logs:', error);
      throw error;
    }
  }

  /**
   * Export logs to CSV
   */
  async exportLogsToCSV(logType, filters = {}) {
    try {
      let logs;
      
      if (logType === 'automation') {
        const result = await this.getAutomationLogs(filters, 1, 10000); // Large limit for export
        logs = result.logs;
      } else if (logType === 'communication') {
        const result = await this.getCommunicationLogs(filters, 1, 10000);
        logs = result.logs;
      } else {
        throw new Error('Invalid log type. Use "automation" or "communication"');
      }

      if (logs.length === 0) {
        return 'No logs to export';
      }

      // Convert to CSV
      const headers = Object.keys(logs[0]).join(',');
      const rows = logs.map(log => 
        Object.values(log).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(',')
      );

      return [headers, ...rows].join('\n');

    } catch (error) {
      console.error('Error exporting logs to CSV:', error);
      throw error;
    }
  }
}

export default AutomationLogger;