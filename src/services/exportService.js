// src/services/api/exportService.js
import { supabase } from '../supabaseClient';

/**
 * Comprehensive service for all export-related database operations
 * Handles all communication with Supabase backend
 */
export const exportService = {
  // ==================== EXPORT ORDERS ====================
// Update the getExportOrders function
// Replace the getExportOrders function with this:
async getExportOrders() {
  try {
    // First, get the export orders without user relationships
    const { data, error } = await supabase
      .from('export_orders')
      .select(`
        *,
        order_id (*),
        export_suppliers (*, supplier_id (*), product_id (*)),
        export_quality_checks (*),
        export_packaging (*),
        export_transport (*),
        export_containers (*),
        export_customs_documents (*),
        export_payments (*),
        export_timeline (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Now let's enrich the data with user information
    const enrichedData = await Promise.all(
      data.map(async (order) => {
        // Get created_by user info
        if (order.created_by) {
          const { data: createdBy } = await supabase
            .from('profiles')
            .select('id, full_name, email, role')
            .eq('id', order.created_by)
            .single();
          order.created_by_user = createdBy;
        }
        
        // Get assigned_to user info
        if (order.assigned_to) {
          const { data: assignedTo } = await supabase
            .from('profiles')
            .select('id, full_name, email, role')
            .eq('id', order.assigned_to)
            .single();
          order.assigned_to_user = assignedTo;
        }
        
        return order;
      })
    );
    
    return enrichedData;
  } catch (error) {
    console.error('Error fetching export orders:', error);
    throw new Error(`Failed to fetch export orders: ${error.message}`);
  }
},

// Also update the getExportOrderById function similarly:
async getExportOrderById(id) {
  try {
    // First, get the export order without user relationships
    const { data: orderData, error: orderError } = await supabase
      .from('export_orders')
      .select(`
        *,
        order_id (*),
        export_suppliers (*, supplier_id (*), product_id (*)),
        export_quality_checks (*),
        export_packaging (*),
        export_transport (*),
        export_containers (*),
        export_customs_documents (*),
        export_payments (*),
        export_timeline (*)
      `)
      .eq('id', id)
      .single();
    
    if (orderError) throw orderError;
    
    // Enrich with user information
    if (orderData.created_by) {
      const { data: createdBy } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('id', orderData.created_by)
        .single();
      orderData.created_by_user = createdBy;
    }
    
    if (orderData.assigned_to) {
      const { data: assignedTo } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('id', orderData.assigned_to)
        .single();
      orderData.assigned_to_user = assignedTo;
    }
    
    return orderData;
  } catch (error) {
    console.error('Error fetching export order:', error);
    throw new Error(`Failed to fetch export order: ${error.message}`);
  }
},

  async createExportOrder(orderData) {
    try {
      const { data, error } = await supabase
        .from('export_orders')
        .insert([{
          ...orderData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Create initial timeline event
      await supabase
        .from('export_timeline')
        .insert([{
          export_order_id: data.id,
          event_type: 'export_created',
          event_description: 'Export order created',
          status: orderData.status || 'draft',
          important: true,
          created_by: orderData.created_by,
          event_time: new Date().toISOString()
        }]);
      
      return data;
    } catch (error) {
      console.error('Error creating export order:', error);
      throw new Error(`Failed to create export order: ${error.message}`);
    }
  },

  async updateExportOrder(id, updates) {
    try {
      const { data, error } = await supabase
        .from('export_orders')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Add timeline event for status changes
      if (updates.status) {
        await supabase
          .from('export_timeline')
          .insert([{
            export_order_id: id,
            event_type: 'status_changed',
            event_description: `Status changed to ${updates.status}`,
            status: updates.status,
            important: true,
            event_time: new Date().toISOString()
          }]);
      }
      
      return data;
    } catch (error) {
      console.error('Error updating export order:', error);
      throw new Error(`Failed to update export order: ${error.message}`);
    }
  },

  // ==================== SUPPLIER MANAGEMENT ====================
  async getExportSuppliers(exportOrderId) {
    try {
      const { data, error } = await supabase
        .from('export_suppliers')
        .select('*, supplier_id (*), product_id (*)')
        .eq('export_order_id', exportOrderId)
        .order('assigned_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw new Error(`Failed to fetch suppliers: ${error.message}`);
    }
  },

  async addSupplierAssignment(supplierData) {
    try {
      const { data, error } = await supabase
        .from('export_suppliers')
        .insert([{
          ...supplierData,
          assigned_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Add timeline event
      await supabase
        .from('export_timeline')
        .insert([{
          export_order_id: supplierData.export_order_id,
          event_type: 'supplier_assigned',
          event_description: `Supplier assigned: ${supplierData.supplier_id} for product ${supplierData.product_id}`,
          status: 'supplier_assigned',
          important: false,
          event_time: new Date().toISOString()
        }]);
      
      return data;
    } catch (error) {
      console.error('Error adding supplier assignment:', error);
      throw new Error(`Failed to add supplier assignment: ${error.message}`);
    }
  },

  async updateSupplierAssignment(id, updates) {
    try {
      const { data, error } = await supabase
        .from('export_suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating supplier assignment:', error);
      throw new Error(`Failed to update supplier assignment: ${error.message}`);
    }
  },

  // ==================== QUALITY CHECKS ====================
  async getQualityChecks(exportOrderId) {
    try {
      const { data, error } = await supabase
        .from('export_quality_checks')
        .select('*')
        .eq('export_order_id', exportOrderId)
        .order('check_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching quality checks:', error);
      throw new Error(`Failed to fetch quality checks: ${error.message}`);
    }
  },

  async addQualityCheck(qualityData) {
    try {
      const { data, error } = await supabase
        .from('export_quality_checks')
        .insert([{
          ...qualityData,
          check_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Add timeline event
      await supabase
        .from('export_timeline')
        .insert([{
          export_order_id: qualityData.export_order_id,
          event_type: 'quality_check',
          event_description: `Quality check performed: ${qualityData.check_type} - Result: ${qualityData.result}`,
          status: 'quality_check',
          important: qualityData.result === 'fail',
          event_time: new Date().toISOString()
        }]);
      
      return data;
    } catch (error) {
      console.error('Error adding quality check:', error);
      throw new Error(`Failed to add quality check: ${error.message}`);
    }
  },

  // ==================== PACKAGING ====================
  async getPackagingDetails(exportOrderId) {
    try {
      const { data, error } = await supabase
        .from('export_packaging')
        .select('*')
        .eq('export_order_id', exportOrderId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching packaging details:', error);
      throw new Error(`Failed to fetch packaging details: ${error.message}`);
    }
  },

  async addPackagingDetails(packagingData) {
    try {
      const { data, error } = await supabase
        .from('export_packaging')
        .insert([{
          ...packagingData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Add timeline event
      await supabase
        .from('export_timeline')
        .insert([{
          export_order_id: packagingData.export_order_id,
          event_type: 'packaging_completed',
          event_description: `Packaging completed: ${packagingData.package_type}, ${packagingData.total_packages} packages`,
          status: 'packaging',
          important: false,
          event_time: new Date().toISOString()
        }]);
      
      return data;
    } catch (error) {
      console.error('Error adding packaging details:', error);
      throw new Error(`Failed to add packaging details: ${error.message}`);
    }
  },

  // ==================== TRANSPORT ====================
  async getTransportDetails(exportOrderId) {
    try {
      const { data, error } = await supabase
        .from('export_transport')
        .select('*')
        .eq('export_order_id', exportOrderId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transport details:', error);
      throw new Error(`Failed to fetch transport details: ${error.message}`);
    }
  },

  async addTransportDetails(transportData) {
    try {
      const { data, error } = await supabase
        .from('export_transport')
        .insert([{
          ...transportData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Add timeline event
      await supabase
        .from('export_timeline')
        .insert([{
          export_order_id: transportData.export_order_id,
          event_type: 'transport_arranged',
          event_description: `Transport arranged: ${transportData.transport_type} by ${transportData.carrier_name}`,
          status: 'transport',
          important: false,
          event_time: new Date().toISOString()
        }]);
      
      return data;
    } catch (error) {
      console.error('Error adding transport details:', error);
      throw new Error(`Failed to add transport details: ${error.message}`);
    }
  },

  // ==================== CONTAINERS ====================
  async getContainers(exportOrderId) {
    try {
      const { data, error } = await supabase
        .from('export_containers')
        .select('*')
        .eq('export_order_id', exportOrderId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching containers:', error);
      throw new Error(`Failed to fetch containers: ${error.message}`);
    }
  },

  async addContainer(containerData) {
    try {
      const { data, error } = await supabase
        .from('export_containers')
        .insert([{
          ...containerData,
          booking_date: containerData.booking_date || new Date().toISOString(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Add timeline event
      await supabase
        .from('export_timeline')
        .insert([{
          export_order_id: containerData.export_order_id,
          event_type: 'container_booked',
          event_description: `Container booked: ${containerData.container_number} via ${containerData.shipping_line}`,
          status: 'container_booked',
          important: true,
          event_time: new Date().toISOString()
        }]);
      
      return data;
    } catch (error) {
      console.error('Error adding container:', error);
      throw new Error(`Failed to add container: ${error.message}`);
    }
  },

  async updateContainer(id, updates) {
    try {
      const { data, error } = await supabase
        .from('export_containers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Add timeline event for status changes
      if (updates.status) {
        const container = await supabase
          .from('export_containers')
          .select('export_order_id, container_number')
          .eq('id', id)
          .single();
        
        if (container.data) {
          await supabase
            .from('export_timeline')
            .insert([{
              export_order_id: container.data.export_order_id,
              event_type: 'container_status_changed',
              event_description: `Container ${container.data.container_number} status: ${updates.status}`,
              status: updates.status,
              important: updates.status === 'customs_hold',
              event_time: new Date().toISOString()
            }]);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error updating container:', error);
      throw new Error(`Failed to update container: ${error.message}`);
    }
  },

  // ==================== CONTAINER TRACKING ====================
  async getContainerTracking(containerId) {
    try {
      const { data, error } = await supabase
        .from('export_container_tracking')
        .select('*')
        .eq('container_id', containerId)
        .order('event_time', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching container tracking:', error);
      throw new Error(`Failed to fetch container tracking: ${error.message}`);
    }
  },

  async addContainerTracking(trackingData) {
    try {
      const { data, error } = await supabase
        .from('export_container_tracking')
        .insert([{
          ...trackingData,
          event_time: trackingData.event_time || new Date().toISOString(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding container tracking:', error);
      throw new Error(`Failed to add container tracking: ${error.message}`);
    }
  },

  // ==================== CUSTOMS DOCUMENTS ====================
  async getCustomsDocuments(exportOrderId) {
    try {
      const { data, error } = await supabase
        .from('export_customs_documents')
        .select('*')
        .eq('export_order_id', exportOrderId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching customs documents:', error);
      throw new Error(`Failed to fetch customs documents: ${error.message}`);
    }
  },

  async addCustomsDocument(documentData) {
    try {
      const { data, error } = await supabase
        .from('export_customs_documents')
        .insert([{
          ...documentData,
          submitted_date: documentData.submitted_date || new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Add timeline event
      await supabase
        .from('export_timeline')
        .insert([{
          export_order_id: documentData.export_order_id,
          event_type: 'document_submitted',
          event_description: `Document submitted: ${documentData.document_type} - ${documentData.document_name}`,
          status: 'document_submitted',
          important: documentData.document_type === 'Bill of Lading',
          event_time: new Date().toISOString()
        }]);
      
      return data;
    } catch (error) {
      console.error('Error adding customs document:', error);
      throw new Error(`Failed to add customs document: ${error.message}`);
    }
  },

  async updateCustomsDocument(id, updates) {
    try {
      const { data, error } = await supabase
        .from('export_customs_documents')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Add timeline event for approval
      if (updates.status === 'approved') {
        const document = await supabase
          .from('export_customs_documents')
          .select('export_order_id, document_type, document_name')
          .eq('id', id)
          .single();
        
        if (document.data) {
          await supabase
            .from('export_timeline')
            .insert([{
              export_order_id: document.data.export_order_id,
              event_type: 'document_approved',
              event_description: `Document approved: ${document.data.document_type} - ${document.data.document_name}`,
              status: 'document_approved',
              important: true,
              event_time: new Date().toISOString()
            }]);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error updating customs document:', error);
      throw new Error(`Failed to update customs document: ${error.message}`);
    }
  },

  // ==================== PAYMENTS ====================
  async getPayments(exportOrderId) {
    try {
      const { data, error } = await supabase
        .from('export_payments')
        .select('*')
        .eq('export_order_id', exportOrderId)
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw new Error(`Failed to fetch payments: ${error.message}`);
    }
  },

  async addPayment(paymentData) {
    try {
      const { data, error } = await supabase
        .from('export_payments')
        .insert([{
          ...paymentData,
          payment_date: paymentData.payment_date || new Date().toISOString(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Add timeline event
      await supabase
        .from('export_timeline')
        .insert([{
          export_order_id: paymentData.export_order_id,
          event_type: 'payment_received',
          event_description: `Payment received: ${paymentData.payment_type} - ₹${paymentData.amount}`,
          status: 'payment_received',
          important: true,
          event_time: new Date().toISOString()
        }]);
      
      return data;
    } catch (error) {
      console.error('Error adding payment:', error);
      throw new Error(`Failed to add payment: ${error.message}`);
    }
  },

  // ==================== TIMELINE ====================
  async getTimeline(exportOrderId) {
    try {
      const { data, error } = await supabase
        .from('export_timeline')
        .select('*, created_by (*)')
        .eq('export_order_id', exportOrderId)
        .order('event_time', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching timeline:', error);
      throw new Error(`Failed to fetch timeline: ${error.message}`);
    }
  },

  async addTimelineEvent(eventData) {
    try {
      const { data, error } = await supabase
        .from('export_timeline')
        .insert([{
          ...eventData,
          event_time: eventData.event_time || new Date().toISOString(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding timeline event:', error);
      throw new Error(`Failed to add timeline event: ${error.message}`);
    }
  },

  // ==================== PHASES (CHECKLIST SYSTEM) ====================
  async getPhases(exportOrderId) {
    try {
      const { data, error } = await supabase
        .from('export_phases')
        .select('*')
        .eq('export_order_id', exportOrderId)
        .order('phase_number', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching phases:', error);
      throw new Error(`Failed to fetch phases: ${error.message}`);
    }
  },

  async addPhase(phaseData) {
    try {
      const { data, error } = await supabase
        .from('export_phases')
        .insert([{
          ...phaseData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding phase:', error);
      throw new Error(`Failed to add phase: ${error.message}`);
    }
  },

  async updatePhase(id, updates) {
    try {
      const { data, error } = await supabase
        .from('export_phases')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Add timeline event for phase completion
      if (updates.status === 'completed') {
        const phase = await supabase
          .from('export_phases')
          .select('export_order_id, phase_number, phase_name')
          .eq('id', id)
          .single();
        
        if (phase.data) {
          await supabase
            .from('export_timeline')
            .insert([{
              export_order_id: phase.data.export_order_id,
              event_type: 'phase_completed',
              event_description: `Phase completed: ${phase.data.phase_name}`,
              status: 'phase_completed',
              important: true,
              event_time: new Date().toISOString()
            }]);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error updating phase:', error);
      throw new Error(`Failed to update phase: ${error.message}`);
    }
  },

  // ==================== ANALYTICS ====================
  async getExportAnalytics(timeframe = 'month') {
    try {
      const { data, error } = await supabase
        .from('export_orders')
        .select('*');
      
      if (error) throw error;
      
      // Process data for comprehensive analytics
      const currentDate = new Date();
      let startDate;
      
      switch (timeframe) {
        case 'week':
          startDate = new Date(currentDate.setDate(currentDate.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));
          break;
        default:
          startDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
      }
      
      const filteredData = data.filter(order => 
        new Date(order.created_at) >= startDate
      );
      
      const analytics = {
        totalOrders: filteredData.length,
        completedOrders: filteredData.filter(order => order.status === 'completed').length,
        inProgressOrders: filteredData.filter(order => 
          order.status !== 'completed' && order.status !== 'cancelled'
        ).length,
        totalRevenue: filteredData.reduce((sum, order) => sum + (order.total_order_value || 0), 0),
        avgOrderValue: filteredData.length > 0 ? 
          filteredData.reduce((sum, order) => sum + (order.total_order_value || 0), 0) / filteredData.length : 0,
        statusDistribution: {},
        monthlyData: {},
        phaseCompletion: {
          phase1: 0,
          phase2: 0,
          phase3: 0,
          phase4: 0
        }
      };
      
      // Calculate status distribution
      filteredData.forEach(order => {
        analytics.statusDistribution[order.status] = (analytics.statusDistribution[order.status] || 0) + 1;
      });
      
      // Calculate monthly data
      filteredData.forEach(order => {
        const month = new Date(order.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!analytics.monthlyData[month]) {
          analytics.monthlyData[month] = { orders: 0, revenue: 0 };
        }
        analytics.monthlyData[month].orders += 1;
        analytics.monthlyData[month].revenue += order.total_order_value || 0;
      });
      
      return analytics;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }
  }
};

export default exportService;