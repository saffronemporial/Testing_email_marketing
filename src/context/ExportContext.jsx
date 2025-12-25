// src/contexts/ExportContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

// Create Export Context
const ExportContext = createContext({});

// Custom hook to use the export context
export const useExport = () => {
  const context = useContext(ExportContext);
  if (!context) {
    throw new Error('useExport must be used within an ExportProvider');
  }
  return context;
};

// Export Provider Component
export const ExportProvider = ({ children }) => {
  const { user, userRole } = useAuth();
  const [exportOrders, setExportOrders] = useState([]);
  const [exportPhases, setExportPhases] = useState([]);
  const [selectedExport, setSelectedExport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user has access to export features
  const hasExportAccess = useCallback(() => {
    return userRole === 'admin' || userRole === 'staff' || userRole === 'manager' || userRole === 'export_manager';
  }, [userRole]);

  // Fetch all export orders with proper joins
  const fetchExportOrders = useCallback(async () => {
    if (!hasExportAccess()) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('export_orders')
        .select(`
          *,
          order_id (*),
          assigned_to_user:profiles!export_orders_assigned_to_fkey (
            id, full_name, email, company_name, phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExportOrders(data || []);
    } catch (err) {
      console.error('Error fetching export orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [hasExportAccess]);

  // Fetch a specific export order with all related data
  const fetchExportOrder = useCallback(async (exportId) => {
    if (!hasExportAccess()) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch the export order
      const { data: orderData, error: orderError } = await supabase
        .from('export_orders')
        .select(`
          *,
          order_id (*),
          assigned_to_user:profiles!export_orders_assigned_to_fkey (
            id, full_name, email, company_name, phone
          )
        `)
        .eq('id', exportId)
        .single();

      if (orderError) throw orderError;

      // Fetch related phases
      const { data: phasesData, error: phasesError } = await supabase
        .from('export_phases')
        .select('*')
        .eq('export_order_id', exportId)
        .order('phase_number', { ascending: true });

      if (phasesError) throw phasesError;

      setSelectedExport({
        ...orderData,
        phases: phasesData || []
      });

      return {
        ...orderData,
        phases: phasesData || []
      };
    } catch (err) {
      console.error('Error fetching export order:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasExportAccess]);

  // Create a new export order
  const createExportOrder = useCallback(async (orderData) => {
    if (!hasExportAccess()) throw new Error('Access denied');

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('export_orders')
        .insert([{
          ...orderData,
          created_by: user.id,
          status: 'confirmed',
          current_phase: 'procurement'
        }])
        .select()
        .single();

      if (error) throw error;

      // Create default phases for this export
      const phases = [
        { phase_number: 1, phase_name: 'Procurement & Pre-shipment', status: 'not_started' },
        { phase_number: 2, phase_name: 'Domestic Transport & Port Handling', status: 'not_started' },
        { phase_number: 3, phase_name: 'Dubai Entry & Final Delivery', status: 'not_started' },
        { phase_number: 4, phase_name: 'Post-Export & Incentives', status: 'not_started' }
      ];

      for (const phase of phases) {
        const { error: phaseError } = await supabase
          .from('export_phases')
          .insert({
            ...phase,
            export_order_id: data.id,
            checklist: getDefaultChecklist(phase.phase_number)
          });

        if (phaseError) throw phaseError;
      }

      // Refresh the export orders list
      await fetchExportOrders();

      return data;
    } catch (err) {
      console.error('Error creating export order:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasExportAccess, user, fetchExportOrders]);

  // Update an export order
  const updateExportOrder = useCallback(async (exportId, updates) => {
    if (!hasExportAccess()) throw new Error('Access denied');

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('export_orders')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', exportId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setExportOrders(prev =>
        prev.map(order => order.id === exportId ? data : order)
      );

      if (selectedExport && selectedExport.id === exportId) {
        setSelectedExport(prev => ({ ...prev, ...data }));
      }

      return data;
    } catch (err) {
      console.error('Error updating export order:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasExportAccess, selectedExport]);

  // Update export phase
  const updateExportPhase = useCallback(async (phaseId, updates) => {
    if (!hasExportAccess()) throw new Error('Access denied');

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('export_phases')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', phaseId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      if (selectedExport) {
        setSelectedExport(prev => ({
          ...prev,
          phases: prev.phases.map(phase =>
            phase.id === phaseId ? data : phase
          )
        }));
      }

      return data;
    } catch (err) {
      console.error('Error updating export phase:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasExportAccess, selectedExport]);

  // OLD FUNCTIONS - Updated to use Supabase

  // Add harvest log
const addHarvestLog = useCallback(async (harvestData) => {
  if (!hasExportAccess()) throw new Error('Access denied');
  
  setLoading(true);
  setError(null);
  
  try {
    const { data, error } = await supabase
      .from('harvest_logs')
      .insert([harvestData])
      .select()
      .single();

    if (error) throw error;
    
    if (selectedExport && selectedExport.id === harvestData.export_order_id) {
      setSelectedExport(prev => ({
        ...prev,
        harvest_logs: [data, ...(prev.harvest_logs || [])]
      }));
    }
    
    return data;
  } catch (err) {
    console.error('Error adding harvest log:', err);
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
}, [hasExportAccess, selectedExport]);

// Add cold chain monitoring
const addColdChainReading = useCallback(async (coldChainData) => {
  if (!hasExportAccess()) throw new Error('Access denied');
  
  setLoading(true);
  setError(null);
  
  try {
    const { data, error } = await supabase
      .from('cold_chain_monitoring')
      .insert([coldChainData])
      .select()
      .single();

    if (error) throw error;
    
    if (selectedExport && selectedExport.id === coldChainData.export_order_id) {
      setSelectedExport(prev => ({
        ...prev,
        cold_chain_monitoring: [data, ...(prev.cold_chain_monitoring || [])]
      }));
    }
    
    return data;
  } catch (err) {
    console.error('Error adding cold chain reading:', err);
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
}, [hasExportAccess, selectedExport]);

  // Add a supplier assignment
  const addSupplierAssignment = useCallback(async (supplierData) => {
    if (!hasExportAccess()) throw new Error('Access denied');
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('export_suppliers')
        .insert([supplierData])
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      if (selectedExport && selectedExport.id === supplierData.export_order_id) {
        setSelectedExport(prev => ({
          ...prev,
          export_suppliers: [data, ...(prev.export_suppliers || [])]
        }));
      }
      
      return data;
    } catch (err) {
      console.error('Error adding supplier assignment:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasExportAccess, selectedExport]);

  // Add a quality check
  const addQualityCheck = useCallback(async (qualityData) => {
    if (!hasExportAccess()) throw new Error('Access denied');
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('export_quality_checks')
        .insert([qualityData])
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      if (selectedExport && selectedExport.id === qualityData.export_order_id) {
        setSelectedExport(prev => ({
          ...prev,
          export_quality_checks: [data, ...(prev.export_quality_checks || [])]
        }));
      }
      
      return data;
    } catch (err) {
      console.error('Error adding quality check:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasExportAccess, selectedExport]);

  // Add packaging details
  const addPackagingDetails = useCallback(async (packagingData) => {
    if (!hasExportAccess()) throw new Error('Access denied');
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('export_packaging')
        .insert([packagingData])
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      if (selectedExport && selectedExport.id === packagingData.export_order_id) {
        setSelectedExport(prev => ({
          ...prev,
          export_packaging: [data, ...(prev.export_packaging || [])]
        }));
      }
      
      return data;
    } catch (err) {
      console.error('Error adding packaging details:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasExportAccess, selectedExport]);

  // Add transport details
  const addTransportDetails = useCallback(async (transportData) => {
    if (!hasExportAccess()) throw new Error('Access denied');
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('export_transport')
        .insert([transportData])
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      if (selectedExport && selectedExport.id === transportData.export_order_id) {
        setSelectedExport(prev => ({
          ...prev,
          export_transport: [data, ...(prev.export_transport || [])]
        }));
      }
      
      return data;
    } catch (err) {
      console.error('Error adding transport details:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasExportAccess, selectedExport]);

  // Add container details
  const addContainerDetails = useCallback(async (containerData) => {
    if (!hasExportAccess()) throw new Error('Access denied');
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('export_containers')
        .insert([containerData])
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      if (selectedExport && selectedExport.id === containerData.export_order_id) {
        setSelectedExport(prev => ({
          ...prev,
          export_containers: [data, ...(prev.export_containers || [])]
        }));
      }
      
      return data;
    } catch (err) {
      console.error('Error adding container details:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasExportAccess, selectedExport]);

  // Update container status
  const updateContainerStatus = useCallback(async (containerId, updates) => {
    if (!hasExportAccess()) throw new Error('Access denied');
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('export_containers')
        .update(updates)
        .eq('id', containerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating container status:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasExportAccess]);

  // Add container tracking
  const addContainerTracking = useCallback(async (trackingData) => {
    if (!hasExportAccess()) throw new Error('Access denied');
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('export_container_tracking')
        .insert([trackingData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error adding container tracking:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasExportAccess]);

  // Add customs document
  const addCustomsDocument = useCallback(async (documentData) => {
    if (!hasExportAccess()) throw new Error('Access denied');
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('export_customs_documents')
        .insert([documentData])
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      if (selectedExport && selectedExport.id === documentData.export_order_id) {
        setSelectedExport(prev => ({
          ...prev,
          export_customs_documents: [data, ...(prev.export_customs_documents || [])]
        }));
      }
      
      return data;
    } catch (err) {
      console.error('Error adding customs document:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasExportAccess, selectedExport]);

  // Update customs document
  const updateCustomsDocument = useCallback(async (documentId, updates) => {
    if (!hasExportAccess()) throw new Error('Access denied');
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('export_customs_documents')
        .update(updates)
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      if (selectedExport) {
        setSelectedExport(prev => ({
          ...prev,
          export_customs_documents: prev.export_customs_documents.map(doc => 
            doc.id === documentId ? data : doc
          )
        }));
      }
      
      return data;
    } catch (err) {
      console.error('Error updating customs document:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasExportAccess, selectedExport]);

  // Add payment record
  const addPaymentRecord = useCallback(async (paymentData) => {
    if (!hasExportAccess()) throw new Error('Access denied');
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('export_payments')
        .insert([paymentData])
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      if (selectedExport && selectedExport.id === paymentData.export_order_id) {
        setSelectedExport(prev => ({
          ...prev,
          export_payments: [data, ...(prev.export_payments || [])]
        }));
      }
      
      return data;
    } catch (err) {
      console.error('Error adding payment record:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasExportAccess, selectedExport]);

  // Add timeline event
  const addTimelineEvent = useCallback(async (eventData) => {
    if (!hasExportAccess()) throw new Error('Access denied');
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('export_timeline')
        .insert([eventData])
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      if (selectedExport && selectedExport.id === eventData.export_order_id) {
        setSelectedExport(prev => ({
          ...prev,
          export_timeline: [data, ...(prev.export_timeline || [])]
        }));
      }
      
      return data;
    } catch (err) {
      console.error('Error adding timeline event:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasExportAccess, selectedExport]);

  // Get phases (OLD FUNCTION - kept for compatibility)
  const getPhases = useCallback(async (exportOrderId) => {
    if (!hasExportAccess()) throw new Error('Access denied');
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('export_phases')
        .select('*')
        .eq('export_order_id', exportOrderId)
        .order('phase_number', { ascending: true });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching phases:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasExportAccess]);

  // Update phase (OLD FUNCTION - kept for compatibility, uses updateExportPhase internally)
  const updatePhase = useCallback(async (phaseId, updates) => {
    return updateExportPhase(phaseId, updates);
  }, [updateExportPhase]);

  // Get analytics
  const getExportAnalytics = useCallback(async (timeframe = 'month') => {
    if (!hasExportAccess()) throw new Error('Access denied');
    
    setLoading(true);
    setError(null);
    
    try {
      // Implement analytics query with Supabase
      const { data, error } = await supabase
        .from('export_orders')
        .select('*');
        
      if (error) throw error;
      
      // Basic analytics calculation (you can enhance this)
      const analytics = {
        totalOrders: data.length,
        completedOrders: data.filter(order => order.status === 'completed').length,
        pendingOrders: data.filter(order => order.status === 'pending').length,
        inProgressOrders: data.filter(order => order.status === 'in_progress').length
      };
      
      return analytics;
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasExportAccess]);

  // Get default checklist for a phase (UPDATED from new file)
  const getDefaultChecklist = useCallback((phaseNumber) => {
    switch (phaseNumber) {
      case 1: // Procurement & Pre-shipment
        return [
          { task: 'Finalize vendor selection', completed: false, important: true },
          { task: 'Execute MoU/contract', completed: false, important: true },
          { task: 'Schedule harvest', completed: false, important: true },
          { task: 'Arrange pre-cooling', completed: false },
          { task: 'Quality assessment (Brix ≥14)', completed: false, important: true },
          { task: 'Packing into branded boxes', completed: false },
          { task: 'Label boxes with origin/batch code', completed: false }
        ];
      case 2: // Domestic Transport & Port Handling
        return [
          { task: 'Book reefer/insulated truck', completed: false, important: true },
          { task: 'Transfer to Turbine transit hub', completed: false },
          { task: 'Transport to Nhava Sheva', completed: false },
          { task: 'Clear at JNPT', completed: false, important: true },
          { task: 'Pay origin THC', completed: false },
          { task: 'Seal container', completed: false },
          { task: 'Submit BL documents', completed: false, important: true },
          { task: 'Arrange ocean shipment', completed: false, important: true },
          { task: 'Verify reefer plug-in', completed: false },
          { task: 'Arrange insurance', completed: false }
        ];
      case 3: // Dubai Entry & Final Delivery
        return [
          { task: 'Submit documents to Dubai customs', completed: false, important: true },
          { task: 'Claim 0% duty under CEPA', completed: false, important: true },
          { task: 'Pay port THC if applicable', completed: false },
          { task: 'Obtain Delivery Order', completed: false },
          { task: 'Arrange local transport', completed: false },
          { task: 'Deliver to client warehouse', completed: false, important: true },
          { task: 'Client inspection', completed: false, important: true },
          { task: 'Resolve discrepancies if any', completed: false }
        ];
      case 4: // Post-Export & Incentives
        return [
          { task: 'File for RoDTEP scrips', completed: false, important: true },
          { task: 'File TMA claim', completed: false },
          { task: 'Claim GST ITC refunds', completed: false },
          { task: 'Review cost-margin performance', completed: false },
          { task: 'Analyze cold chain logs', completed: false },
          { task: 'Update vendor performance', completed: false }
        ];
      default:
        return [];
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear selected export
  const clearSelectedExport = useCallback(() => {
    setSelectedExport(null);
  }, []);

  // Load initial data
  useEffect(() => {
    if (hasExportAccess()) {
      fetchExportOrders();
    }
  }, [hasExportAccess, fetchExportOrders]);

  // Context value
  const value = {
    exportOrders,
    exportPhases: selectedExport?.phases || [],
    selectedExport,
    loading,
    error,
    hasExportAccess,
    fetchExportOrders,
    fetchExportOrder,
    createExportOrder,
    updateExportOrder,
    addSupplierAssignment,
    addPackagingDetails,
    addTransportDetails,
    addContainerDetails,
    updateContainerStatus,
    addContainerTracking,
    addCustomsDocument,
    updateCustomsDocument,
    addPaymentRecord,
    addTimelineEvent,
    addHarvestLog,
    addQualityCheck, // This is the harvest version
    addColdChainReading,
    getPhases,
    updatePhase,
    updateExportPhase, // NEW function from latest file
    getExportAnalytics,
    getDefaultChecklist,
    clearError,
    clearSelectedExport
  };

  return (
    <ExportContext.Provider value={value}>
      {children}
    </ExportContext.Provider>
  );
};

export default ExportContext;