// hooks/useFreightTracking.js
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export const useFreightTracking = () => {
  const [shipments, setShipments] = useState([]);
  const [activeShipments, setActiveShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all shipments
  const fetchShipments = async () => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          client:clients(name, contact_email),
          products:shipment_products(product_name, quantity, quality_grade)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setShipments(data);
      setActiveShipments(data.filter(shipment => 
        ['LOADING', 'IN_TRANSIT', 'CUSTOMS'].includes(shipment.status)
      ));
    } catch (error) {
      console.error('Error fetching shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new shipment
  const createShipment = async (shipmentData) => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .insert([{
          ...shipmentData,
          tracking_number: generateTrackingNumber(),
          status: 'PROCESSING',
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      
      // Create shipment documents automatically
      await generateShipmentDocuments(data[0].id);
      
      return data[0];
    } catch (error) {
      console.error('Error creating shipment:', error);
      throw error;
    }
  };

  // Update shipment status
  const updateShipmentStatus = async (shipmentId, newStatus, notes = '') => {
    try {
      const { error } = await supabase
        .from('shipments')
        .update({ 
          status: newStatus,
          status_updated_at: new Date().toISOString(),
          status_notes: notes
        })
        .eq('id', shipmentId);

      if (error) throw error;
      
      // Log status change
      await supabase
        .from('shipment_logs')
        .insert({
          shipment_id: shipmentId,
          status: newStatus,
          notes: notes,
          timestamp: new Date().toISOString()
        });
      
      await fetchShipments(); // Refresh data
    } catch (error) {
      console.error('Error updating shipment status:', error);
      throw error;
    }
  };

  // Generate shipping documents
  const generateShipmentDocuments = async (shipmentId) => {
    const documents = [
      { type: 'COMMERCIAL_INVOICE', name: `Invoice_${shipmentId}.pdf` },
      { type: 'PACKING_LIST', name: `PackingList_${shipmentId}.pdf` },
      { type: 'CERTIFICATE_OF_ORIGIN', name: `OriginCertificate_${shipmentId}.pdf` },
      { type: 'PHYTOSANITARY_CERTIFICATE', name: `Phytosanitary_${shipmentId}.pdf` }
    ];

    try {
      for (const doc of documents) {
        await supabase
          .from('shipment_documents')
          .insert({
            shipment_id: shipmentId,
            document_type: doc.type,
            document_name: doc.name,
            status: 'GENERATED',
            generated_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error generating documents:', error);
    }
  };

  // Real-time shipment tracking
  const simulateShipmentProgress = (shipmentId) => {
    // This would integrate with actual shipping APIs
    // For now, we simulate progress
    const intervals = setInterval(async () => {
      const shipment = shipments.find(s => s.id === shipmentId);
      if (shipment && shipment.status !== 'DELIVERED') {
        const progress = Math.min(shipment.progress + 5, 100);
        
        await supabase
          .from('shipments')
          .update({ progress: progress })
          .eq('id', shipmentId);

        // Update status based on progress
        if (progress >= 100) {
          await updateShipmentStatus(shipmentId, 'DELIVERED', 'Shipment successfully delivered');
          clearInterval(intervals);
        } else if (progress >= 80 && shipment.status !== 'CUSTOMS') {
          await updateShipmentStatus(shipmentId, 'CUSTOMS', 'Arrived at destination port');
        } else if (progress >= 30 && shipment.status === 'PROCESSING') {
          await updateShipmentStatus(shipmentId, 'IN_TRANSIT', 'Departed from origin port');
        }
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(intervals);
  };

  useEffect(() => {
    fetchShipments();

    // Real-time subscription for shipment updates
    const shipmentSubscription = supabase
      .channel('shipments')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'shipments' },
        (payload) => {
          fetchShipments(); // Refresh when any change happens
        }
      )
      .subscribe();

    return () => {
      shipmentSubscription.unsubscribe();
    };
  }, []);

  return {
    shipments,
    activeShipments,
    loading,
    createShipment,
    updateShipmentStatus,
    simulateShipmentProgress,
    refreshShipments: fetchShipments
  };
};

const generateTrackingNumber = () => {
  return `SE${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
};