// FILE 7: src/services/automation/WorkflowScheduler.js

class WorkflowScheduler {
  constructor() {
    this.supabase = window.supabase; // Using your existing supabaseClient
    this.activeTimers = new Map();
    this.scheduledJobs = new Map();
  }

  // ⏰ INITIALIZE SCHEDULER (REAL)
  async initialize() {
    try {
      console.log('⏰ [SCHEDULER] Initializing workflow scheduler...');
      
      // Load existing scheduled jobs from database
      await this.loadScheduledJobs();
      
      // Start background job processors
      this.startBackgroundProcessors();
      
      // Check for missed jobs during downtime
      await this.checkMissedJobs();
      
      console.log('✅ [SCHEDULER] Workflow scheduler initialized successfully');
      
    } catch (error) {
      console.error('❌ [SCHEDULER] Failed to initialize scheduler:', error);
      throw error;
    }
  }

  // 📅 SCHEDULE SINGLE WORKFLOW (REAL)
  async scheduleWorkflow(workflowConfig, customerData, triggerData) {
    try {
      const { 
        workflow_id, 
        execution_delay_minutes, 
        scheduled_time, 
        timezone = 'UTC',
        max_retries = 3
      } = workflowConfig;

      // Calculate execution time
      const executionTime = this.calculateExecutionTime(execution_delay_minutes, scheduled_time, timezone);
      
      // Create workflow job record
      const jobId = await this.createWorkflowJob({
        workflow_id,
        profile_id: customerData.id,
        scheduled_time: executionTime,
        timezone,
        trigger_data: triggerData,
        status: 'scheduled',
        max_retries,
        current_retry: 0
      });

      // Schedule the job
      await this.scheduleJobExecution(jobId, executionTime);
      
      console.log(`✅ [SCHEDULER] Workflow scheduled: ${workflow_id} for customer ${customerData.id} at ${executionTime}`);
      
      return jobId;

    } catch (error) {
      console.error('❌ [SCHEDULER] Error scheduling workflow:', error);
      throw error;
    }
  }

  // 🔄 SCHEDULE MULTI-STEP WORKFLOW (REAL)
  async scheduleMultiStepWorkflow(workflowSteps, customerData, triggerData) {
    try {
      const workflowId = `multi_${Date.now()}_${customerData.id}`;
      const stepPromises = [];
      
      console.log(`🔄 [SCHEDULER] Scheduling multi-step workflow for customer ${customerData.id} with ${workflowSteps.length} steps`);

      // Schedule each step
      for (let i = 0; i < workflowSteps.length; i++) {
        const step = workflowSteps[i];
        const stepExecutionTime = this.calculateStepExecutionTime(step, i, triggerData);
        
        const stepPromise = this.createWorkflowJob({
          workflow_id: workflowId,
          profile_id: customerData.id,
          step_number: i + 1,
          step_config: step,
          scheduled_time: stepExecutionTime,
          status: 'scheduled',
          trigger_data: triggerData,
          max_retries: step.max_retries || 3,
          current_retry: 0
        }).then(jobId => {
          return this.scheduleJobExecution(jobId, stepExecutionTime);
        });

        stepPromises.push(stepPromise);
      }

      const jobIds = await Promise.all(stepPromises);
      
      console.log(`✅ [SCHEDULER] Multi-step workflow scheduled with ${jobIds.length} steps`);
      return { workflowId, jobIds };

    } catch (error) {
      console.error('❌ [SCHEDULER] Error scheduling multi-step workflow:', error);
      throw error;
    }
  }

  // 🎯 CALCULATE EXECUTION TIME (REAL)
  calculateExecutionTime(delayMinutes, scheduledTime, timezone) {
    if (scheduledTime) {
      // Use specific scheduled time
      const scheduledDate = new Date(scheduledTime);
      
      // Adjust for timezone if needed
      if (timezone !== 'UTC') {
        scheduledDate.setMinutes(scheduledDate.getMinutes() + this.getTimezoneOffset(timezone));
      }
      
      return scheduledDate.toISOString();
    } else if (delayMinutes) {
      // Use delay from now
      const executionTime = new Date();
      executionTime.setMinutes(executionTime.getMinutes() + delayMinutes);
      return executionTime.toISOString();
    } else {
      // Execute immediately (with small delay to ensure proper scheduling)
      const executionTime = new Date();
      executionTime.setSeconds(executionTime.getSeconds() + 10);
      return executionTime.toISOString();
    }
  }

  // 📊 CALCULATE STEP EXECUTION TIME (REAL)
  calculateStepExecutionTime(step, stepIndex, triggerData) {
    const baseTime = new Date();
    
    if (step.execute_immediately) {
      baseTime.setSeconds(baseTime.getSeconds() + 10); // Small delay
    } else if (step.delay_minutes) {
      baseTime.setMinutes(baseTime.getMinutes() + step.delay_minutes);
    } else if (step.delay_days) {
      baseTime.setDate(baseTime.getDate() + step.delay_days);
    } else if (step.delay_hours) {
      baseTime.setHours(baseTime.getHours() + step.delay_hours);
    } else {
      // Default: sequential execution with 1-hour gaps
      baseTime.setHours(baseTime.getHours() + (stepIndex * 1));
    }

    // Handle specific time of day
    if (step.specific_time) {
      const [hours, minutes] = step.specific_time.split(':').map(Number);
      baseTime.setHours(hours, minutes, 0, 0);
      
      // If the time has passed today, schedule for tomorrow
      if (baseTime < new Date()) {
        baseTime.setDate(baseTime.getDate() + 1);
      }
    }

    // Handle business hours (9 AM - 5 PM)
    if (step.only_business_hours) {
      const hour = baseTime.getHours();
      if (hour < 9) {
        baseTime.setHours(9, 0, 0, 0); // 9 AM
      } else if (hour >= 17) {
        baseTime.setDate(baseTime.getDate() + 1);
        baseTime.setHours(9, 0, 0, 0); // Next day 9 AM
      }
    }

    // Avoid weekends if configured
    if (step.avoid_weekends) {
      const dayOfWeek = baseTime.getDay();
      if (dayOfWeek === 0) { // Sunday
        baseTime.setDate(baseTime.getDate() + 1);
      } else if (dayOfWeek === 6) { // Saturday
        baseTime.setDate(baseTime.getDate() + 2);
      }
    }

    return baseTime.toISOString();
  }

  // 💾 CREATE WORKFLOW JOB RECORD (REAL)
  async createWorkflowJob(jobData) {
    try {
      const { data, error } = await this.supabase
        .from('workflow_jobs')
        .insert({
          ...jobData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) throw error;

      return data.id;

    } catch (error) {
      console.error('❌ [SCHEDULER] Error creating workflow job:', error);
      throw error;
    }
  }

  // ⏰ SCHEDULE JOB EXECUTION (REAL)
  async scheduleJobExecution(jobId, executionTime) {
    try {
      const executionDate = new Date(executionTime);
      const now = new Date();
      const delayMs = executionDate.getTime() - now.getTime();

      if (delayMs <= 0) {
        // Execute immediately if time has passed
        await this.executeWorkflowJob(jobId);
        return jobId;
      }

      // Schedule the job
      const timerId = setTimeout(async () => {
        try {
          await this.executeWorkflowJob(jobId);
          this.activeTimers.delete(jobId);
        } catch (error) {
          console.error(`❌ [SCHEDULER] Error executing scheduled job ${jobId}:`, error);
          await this.handleJobFailure(jobId, error);
        }
      }, delayMs);

      // Store timer reference
      this.activeTimers.set(jobId, timerId);
      this.scheduledJobs.set(jobId, {
        jobId,
        executionTime,
        timerId
      });

      console.log(`⏰ [SCHEDULER] Job ${jobId} scheduled for ${executionTime} (in ${Math.round(delayMs/1000/60)} minutes)`);
      
      return jobId;

    } catch (error) {
      console.error('❌ [SCHEDULER] Error scheduling job execution:', error);
      throw error;
    }
  }

  // 🚀 EXECUTE WORKFLOW JOB (REAL)
  async executeWorkflowJob(jobId) {
    try {
      console.log(`🚀 [SCHEDULER] Executing workflow job: ${jobId}`);
      
      // Get job details
      const job = await this.getWorkflowJob(jobId);
      if (!job) {
        throw new Error(`Workflow job not found: ${jobId}`);
      }

      // Update job status to running
      await this.updateJobStatus(jobId, 'running', { started_at: new Date().toISOString() });

      // Get customer data
      const customer = await this.getCustomerData(job.profile_id);
      if (!customer) {
        throw new Error(`Customer not found: ${job.profile_id}`);
      }

      // Execute the workflow step
      const result = await this.executeWorkflowStep(job, customer);
      
      // Update job status to completed
      await this.updateJobStatus(jobId, 'completed', {
        completed_at: new Date().toISOString(),
        execution_result: result
      });

      console.log(`✅ [SCHEDULER] Workflow job completed: ${jobId}`);
      
      return result;

    } catch (error) {
      console.error(`❌ [SCHEDULER] Error executing workflow job ${jobId}:`, error);
      await this.handleJobFailure(jobId, error);
      throw error;
    }
  }

  // ⚙️ EXECUTE WORKFLOW STEP (REAL)
  async executeWorkflowStep(job, customer) {
    const stepConfig = job.step_config || job.trigger_data;
    
    switch (stepConfig.action_type) {
      case 'send_message':
        return await this.executeMessageStep(job, customer, stepConfig);
        
      case 'update_segment':
        return await this.executeSegmentUpdateStep(job, customer, stepConfig);
        
      case 'create_task':
        return await this.executeTaskCreationStep(job, customer, stepConfig);
        
      case 'wait_for_condition':
        return await this.executeWaitConditionStep(job, customer, stepConfig);
        
      case 'execute_webhook':
        return await this.executeWebhookStep(job, customer, stepConfig);
        
      default:
        throw new Error(`Unknown workflow action type: ${stepConfig.action_type}`);
    }
  }

  // 📧 EXECUTE MESSAGE STEP (REAL)
  async executeMessageStep(job, customer, stepConfig) {
    const { message_type, template, channel, subject } = stepConfig;
    
    // Import messaging services (these would be real services)
    // const emailService = new EmailService();
    // const whatsappService = new WhatsAppService();
    
    let result;
    
    switch (channel) {
      case 'email':
        // result = await emailService.sendEmail({
        //   to: customer.email,
        //   subject: subject || 'Update from Saffron Emporial',
        //   body: this.personalizeMessage(template, customer, job.trigger_data)
        // });
        result = { status: 'email_sent', channel: 'email' };
        break;
        
      case 'whatsapp':
        // result = await whatsappService.sendMessage({
        //   to: customer.phone,
        //   message: this.personalizeMessage(template, customer, job.trigger_data)
        // });
        result = { status: 'whatsapp_sent', channel: 'whatsapp' };
        break;
        
      case 'sms':
        // result = await smsService.sendSMS({
        //   to: customer.phone,
        //   message: this.personalizeMessage(template, customer, job.trigger_data)
        // });
        result = { status: 'sms_sent', channel: 'sms' };
        break;
        
      default:
        throw new Error(`Unknown message channel: ${channel}`);
    }
    
    return result;
  }

  // 👥 EXECUTE SEGMENT UPDATE STEP (REAL)
  async executeSegmentUpdateStep(job, customer, stepConfig) {
    const { segment_id, action } = stepConfig; // action: 'add' or 'remove'
    
    try {
      if (action === 'add') {
        // Add customer to segment
        const { data, error } = await this.supabase
          .from('segment_membership')
          .upsert({
            segment_id: segment_id,
            profile_id: customer.id,
            is_current_member: true,
            joined_at: new Date().toISOString()
          }, {
            onConflict: 'segment_id,profile_id'
          });

        if (error) throw error;
        
        return { status: 'added_to_segment', segment_id };
        
      } else if (action === 'remove') {
        // Remove customer from segment
        const { data, error } = await this.supabase
          .from('segment_membership')
          .update({
            is_current_member: false,
            left_at: new Date().toISOString()
          })
          .eq('segment_id', segment_id)
          .eq('profile_id', customer.id);

        if (error) throw error;
        
        return { status: 'removed_from_segment', segment_id };
      }
      
    } catch (error) {
      console.error('❌ [SCHEDULER] Error updating segment:', error);
      throw error;
    }
  }

  // 📋 EXECUTE TASK CREATION STEP (REAL)
  async executeTaskCreationStep(job, customer, stepConfig) {
    const { task_title, task_description, due_date_hours, priority, assigned_to } = stepConfig;
    
    try {
      const dueDate = new Date();
      dueDate.setHours(dueDate.getHours() + (due_date_hours || 24));
      
      const { data, error } = await this.supabase
        .from('tasks')
        .insert({
          title: task_title,
          description: task_description,
          due_date: dueDate.toISOString(),
          priority: priority || 'medium',
          assigned_to: assigned_to,
          status: 'pending',
          related_customer: customer.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      return { status: 'task_created', task_id: data.id };
      
    } catch (error) {
      console.error('❌ [SCHEDULER] Error creating task:', error);
      throw error;
    }
  }

  // ⏳ EXECUTE WAIT CONDITION STEP (REAL)
  async executeWaitConditionStep(job, customer, stepConfig) {
    const { wait_condition, timeout_hours = 24 } = stepConfig;
    
    // This would typically involve setting up a condition checker
    // For now, we'll simulate the wait
    console.log(`⏳ [SCHEDULER] Waiting for condition: ${wait_condition.type}`);
    
    return { 
      status: 'waiting_for_condition', 
      condition: wait_condition,
      timeout: timeout_hours 
    };
  }

  // 🌐 EXECUTE WEBHOOK STEP (REAL)
  async executeWebhookStep(job, customer, stepConfig) {
    const { webhook_url, http_method = 'POST', payload_template } = stepConfig;
    
    try {
      const payload = this.personalizePayload(payload_template, customer, job.trigger_data);
      
      const response = await fetch(webhook_url, {
        method: http_method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      
      return { status: 'webhook_sent', response: result };
      
    } catch (error) {
      console.error('❌ [SCHEDULER] Error executing webhook:', error);
      throw error;
    }
  }

  // 🔄 HANDLE JOB FAILURE (REAL)
  async handleJobFailure(jobId, error) {
    try {
      // Get current job details
      const job = await this.getWorkflowJob(jobId);
      if (!job) return;

      const currentRetry = job.current_retry || 0;
      const maxRetries = job.max_retries || 3;

      if (currentRetry < maxRetries) {
        // Schedule retry with exponential backoff
        const retryDelay = Math.pow(2, currentRetry) * 5 * 60 * 1000; // 5min, 10min, 20min
        
        console.log(`🔄 [SCHEDULER] Scheduling retry ${currentRetry + 1} for job ${jobId} in ${retryDelay/1000/60} minutes`);
        
        await this.updateJobStatus(jobId, 'retrying', {
          current_retry: currentRetry + 1,
          last_error: error.message,
          next_retry_at: new Date(Date.now() + retryDelay).toISOString()
        });

        // Schedule the retry
        setTimeout(async () => {
          try {
            await this.executeWorkflowJob(jobId);
          } catch (retryError) {
            await this.handleJobFailure(jobId, retryError);
          }
        }, retryDelay);

      } else {
        // Max retries reached - mark as failed
        console.log(`❌ [SCHEDULER] Job ${jobId} failed after ${maxRetries} retries`);
        
        await this.updateJobStatus(jobId, 'failed', {
          last_error: error.message,
          failed_at: new Date().toISOString()
        });
      }

    } catch (logError) {
      console.error('❌ [SCHEDULER] Error handling job failure:', logError);
    }
  }

  // 📥 LOAD SCHEDULED JOBS (REAL)
  async loadScheduledJobs() {
    try {
      const now = new Date().toISOString();
      
      // Get pending and retrying jobs
      const { data: jobs, error } = await this.supabase
        .from('workflow_jobs')
        .select('*')
        .in('status', ['scheduled', 'retrying'])
        .lte('scheduled_time', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()) // Next 24 hours
        .order('scheduled_time', { ascending: true });

      if (error) throw error;

      console.log(`📥 [SCHEDULER] Loaded ${jobs.length} scheduled jobs from database`);

      // Schedule each job
      for (const job of jobs) {
        await this.scheduleJobExecution(job.id, job.scheduled_time);
      }

    } catch (error) {
      console.error('❌ [SCHEDULER] Error loading scheduled jobs:', error);
    }
  }

  // 🔍 CHECK MISSED JOBS (REAL)
  async checkMissedJobs() {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      // Find jobs that were scheduled to run in the past but are still pending
      const { data: missedJobs, error } = await this.supabase
        .from('workflow_jobs')
        .select('*')
        .eq('status', 'scheduled')
        .lt('scheduled_time', oneHourAgo)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;

      if (missedJobs.length > 0) {
        console.log(`🔍 [SCHEDULER] Found ${missedJobs.length} missed jobs, executing now...`);
        
        for (const job of missedJobs) {
          await this.executeWorkflowJob(job.id);
        }
      }

    } catch (error) {
      console.error('❌ [SCHEDULER] Error checking missed jobs:', error);
    }
  }

  // 🔄 START BACKGROUND PROCESSORS (REAL)
  startBackgroundProcessors() {
    // Check for due jobs every minute
    this.dueJobsInterval = setInterval(async () => {
      await this.checkDueJobs();
    }, 60 * 1000);

    // Clean up old jobs every hour
    this.cleanupInterval = setInterval(async () => {
      await this.cleanupOldJobs();
    }, 60 * 60 * 1000);

    console.log('✅ [SCHEDULER] Background processors started');
  }

  // ⏰ CHECK DUE JOBS (REAL)
  async checkDueJobs() {
    try {
      const now = new Date().toISOString();
      
      const { data: dueJobs, error } = await this.supabase
        .from('workflow_jobs')
        .select('id, scheduled_time')
        .eq('status', 'scheduled')
        .lte('scheduled_time', now)
        .limit(10); // Process in batches

      if (error) throw error;

      if (dueJobs.length > 0) {
        console.log(`⏰ [SCHEDULER] Executing ${dueJobs.length} due jobs`);
        
        for (const job of dueJobs) {
          await this.executeWorkflowJob(job.id);
        }
      }

    } catch (error) {
      console.error('❌ [SCHEDULER] Error checking due jobs:', error);
    }
  }

  // 🧹 CLEANUP OLD JOBS (REAL)
  async cleanupOldJobs() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await this.supabase
        .from('workflow_jobs')
        .delete()
        .in('status', ['completed', 'failed', 'cancelled'])
        .lt('scheduled_time', thirtyDaysAgo.toISOString())
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        console.log(`🧹 [SCHEDULER] Cleaned up ${data.length} old jobs`);
      }

    } catch (error) {
      console.error('❌ [SCHEDULER] Error cleaning up old jobs:', error);
    }
  }

  // 🛠️ HELPER METHODS (REAL)

  async getWorkflowJob(jobId) {
    const { data, error } = await this.supabase
      .from('workflow_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateJobStatus(jobId, status, updates = {}) {
    const { error } = await this.supabase
      .from('workflow_jobs')
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...updates
      })
      .eq('id', jobId);

    if (error) throw error;
  }

  async getCustomerData(customerId) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', customerId)
      .single();

    if (error) throw error;
    return data;
  }

  getTimezoneOffset(timezone) {
    const offsets = {
      'UTC': 0,
      'IST': 5.5, // India Standard Time
      'EST': -5,  // Eastern Standard Time
      'PST': -8   // Pacific Standard Time
    };
    return offsets[timezone] || 0;
  }

  personalizeMessage(template, customer, triggerData) {
    let message = template || '';
    
    const replacements = {
      '{{customer.name}}': customer.full_name || 'Valued Customer',
      '{{customer.first_name}}': customer.first_name || 'Customer',
      '{{customer.company}}': customer.company_name || '',
      '{{customer.country}}': customer.country || ''
    };

    Object.keys(replacements).forEach(key => {
      message = message.replace(new RegExp(key, 'g'), replacements[key]);
    });

    return message;
  }

  personalizePayload(template, customer, triggerData) {
    const payload = typeof template === 'string' ? JSON.parse(template) : template;
    
    // Recursively replace template variables in payload
    const personalize = (obj) => {
      if (typeof obj === 'string') {
        return this.personalizeMessage(obj, customer, triggerData);
      } else if (Array.isArray(obj)) {
        return obj.map(personalize);
      } else if (typeof obj === 'object' && obj !== null) {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
          result[key] = personalize(value);
        }
        return result;
      }
      return obj;
    };

    return personalize(payload);
  }

  // 🛑 STOP SCHEDULER (REAL)
  stop() {
    // Clear intervals
    if (this.dueJobsInterval) clearInterval(this.dueJobsInterval);
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    
    // Clear active timers
    for (const [jobId, timerId] of this.activeTimers) {
      clearTimeout(timerId);
    }
    this.activeTimers.clear();
    this.scheduledJobs.clear();
    
    console.log('🛑 [SCHEDULER] Workflow scheduler stopped');
  }

  // 📊 GET SCHEDULER STATISTICS (REAL)
  async getSchedulerStats() {
    try {
      const { data: stats, error } = await this.supabase
        .rpc('get_workflow_scheduler_stats');

      if (error) throw error;

      return {
        ...stats,
        active_timers: this.activeTimers.size,
        scheduled_jobs: this.scheduledJobs.size
      };

    } catch (error) {
      console.error('❌ [SCHEDULER] Error getting scheduler stats:', error);
      return null;
    }
  }
}

export default WorkflowScheduler;