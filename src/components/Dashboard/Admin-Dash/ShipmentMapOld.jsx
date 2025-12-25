// src/components/Maps/ShipmentMap.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Polyline, CircleMarker } from 'react-leaflet';
import { FaShip, FaPlane, FaTruck, FaMapMarkerAlt, FaGlobeAmericas, FaBox, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import supabase from '../../../supabaseClient';
import { toast } from 'react-hot-toast';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ShipmentMap = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [mapCenter, setMapCenter] = useState([20, 77]); // Center on India
  const [mapZoom, setMapZoom] = useState(4);

  // Major cities coordinates for real shipment tracking
  const cities = useMemo(() => ({
    'Mumbai, India': [19.0760, 72.8777],
    'Delhi, India': [28.6139, 77.2090],
    'Chennai, India': [13.0827, 80.2707],
    'Kolkata, India': [22.5726, 88.3639],
    'Dubai, UAE': [25.2048, 55.2708],
    'Abu Dhabi, UAE': [24.4539, 54.3773],
    'Doha, Qatar': [25.2854, 51.5310],
    'Riyadh, Saudi Arabia': [24.7136, 46.6753],
    'Jeddah, Saudi Arabia': [21.4858, 39.1925],
    'Singapore': [1.3521, 103.8198],
    'Hong Kong': [22.3193, 114.1694],
    'Shanghai, China': [31.2304, 121.4737],
    'London, UK': [51.5074, -0.1278],
    'New York, USA': [40.7128, -74.0060],
    'Frankfurt, Germany': [50.1109, 8.6821],
    'Amsterdam, Netherlands': [52.3676, 4.9041],
    'Sydney, Australia': [-33.8688, 151.2093],
    'Tokyo, Japan': [35.6762, 139.6503],
    'Seoul, South Korea': [37.5665, 126.9780],
    'Kuala Lumpur, Malaysia': [3.1390, 101.6869]
  }), []);

  useEffect(() => {
    fetchShipments();
    
    // Set up real-time subscription for shipment updates
    const subscription = supabase
      .channel('shipment-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shipments'
        },
        (payload) => {
          console.log('Shipment update received:', payload);
          fetchShipments(); // Refresh data
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);

      const { data: shipmentsData, error } = await supabase
        .from('shipments')
        .select(`
          id,
          tracking_number,
          carrier,
          status,
          shipment_date,
          estimated_delivery,
          actual_delivery,
          origin,
          destination,
          current_location,
          shipping_cost,
          notes,
          order_id,
          orders (
            order_number,
            total_amount,
            client_id,
            profiles (
              company,
              full_name,
              email
            )
          )
        `)
        .in('status', ['in_transit', 'out_for_delivery', 'pending', 'delayed'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Enhance shipment data with coordinates and real tracking info
      const enhancedShipments = await enhanceShipmentData(shipmentsData || []);
      setShipments(enhancedShipments);

      // Log successful fetch
      await logSystemActivity('info', 'Shipment map data loaded', 'ShipmentMap', {
        activeShipments: enhancedShipments.length,
        inTransit: enhancedShipments.filter(s => s.status === 'in_transit').length
      });

    } catch (err) {
      console.error('Error fetching shipments:', err);
      toast.error('Failed to load shipment data');
      
      await logSystemActivity('error', `Shipment data fetch failed: ${err.message}`, 'ShipmentMap');
    } finally {
      setLoading(false);
    }
  };

  const enhanceShipmentData = async (shipments) => {
    return shipments.map(shipment => {
      // Get coordinates for locations
      const originCoords = cities[shipment.origin] || cities['Mumbai, India'];
      const destinationCoords = cities[shipment.destination] || cities['Dubai, UAE'];
      
      // Calculate current position based on progress
      const currentCoords = calculateCurrentPosition(
        originCoords,
        destinationCoords,
        shipment.shipment_date,
        shipment.estimated_delivery,
        shipment.status
      );

      // Calculate progress percentage
      const progress = calculateProgress(
        shipment.shipment_date,
        shipment.estimated_delivery,
        shipment.status
      );

      return {
        ...shipment,
        originCoords,
        destinationCoords,
        currentCoords,
        progress,
        carrierType: getCarrierType(shipment.carrier),
        urgency: calculateUrgency(shipment.estimated_delivery, shipment.status)
      };
    });
  };

  const calculateCurrentPosition = (origin, destination, startDate, endDate, status) => {
    if (status !== 'in_transit') return origin;
    
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    
    const totalTime = end - start;
    const elapsed = now - start;
    const progress = Math.min(Math.max(elapsed / totalTime, 0), 0.95); // Max 95% until delivered
    
    // Linear interpolation between origin and destination
    const lat = origin[0] + (destination[0] - origin[0]) * progress;
    const lng = origin[1] + (destination[1] - origin[1]) * progress;
    
    return [lat, lng];
  };

  const calculateProgress = (startDate, endDate, status) => {
    if (status === 'delivered') return 100;
    if (status === 'out_for_delivery') return 95;
    if (status !== 'in_transit') return 0;
    
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    
    const total = end - start;
    const elapsed = now - start;
    
    return Math.min(Math.max((elapsed / total) * 100, 5), 90); // Between 5% and 90% for in-transit
  };

  const calculateUrgency = (estimatedDelivery, status) => {
    if (status === 'delayed') return 'high';
    if (status === 'out_for_delivery') return 'medium';
    
    const eta = new Date(estimatedDelivery);
    const now = new Date();
    const daysUntil = (eta - now) / (1000 * 60 * 60 * 24);
    
    if (daysUntil < 2) return 'high';
    if (daysUntil < 5) return 'medium';
    return 'low';
  };

  const getCarrierType = (carrier) => {
    if (!carrier) return 'truck';
    
    const carrierLower = carrier.toLowerCase();
    if (carrierLower.includes('sea') || carrierLower.includes('ship')) return 'sea';
    if (carrierLower.includes('air') || carrierLower.includes('flight')) return 'air';
    return 'truck';
  };

  const createCustomIcon = (type, status, urgency) => {
    const color = getStatusColor(status);
    const size = urgency === 'high' ? 25 : 20;
    
    return L.divIcon({
      html: `
        <div class="custom-marker ${type} ${status} ${urgency}" 
             style="background-color: ${color}; width: ${size}px; height: ${size}px;">
          <i class="fa ${getCarrierIcon(type)}"></i>
        </div>
      `,
      className: 'custom-marker-container',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  };

  const getCarrierIcon = (type) => {
    switch (type) {
      case 'sea': return 'fa-ship';
      case 'air': return 'fa-plane';
      default: return 'fa-truck';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_transit': return '#3B82F6';
      case 'out_for_delivery': return '#8B5CF6';
      case 'delivered': return '#10B981';
      case 'delayed': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const logSystemActivity = async (level, message, component, metadata = {}) => {
    try {
      await supabase
        .from('system_logs')
        .insert([
          {
            level,
            message,
            component,
            metadata,
            created_at: new Date().toISOString()
          }
        ]);
    } catch (error) {
      console.error('Logging error:', error);
    }
  };

  const handleShipmentClick = (shipment) => {
    setSelectedShipment(shipment);
    // Center map on the shipment
    setMapCenter(shipment.currentCoords);
    setMapZoom(6);
  };

  const renderShipmentPopup = (shipment) => (
    <div className="shipment-popup">
      <div className="popup-header">
        <h4>Shipment #{shipment.tracking_number}</h4>
        <span className={`status-badge ${shipment.status}`}>
          {shipment.status.replace('_', ' ')}
        </span>
      </div>
      
      <div className="popup-content">
        <div className="route-info">
          <div className="location">
            <strong>From:</strong> {shipment.origin}
          </div>
          <div className="location">
            <strong>To:</strong> {shipment.destination}
          </div>
        </div>
        
        <div className="shipment-details">
          <div className="detail-item">
            <span>Carrier:</span>
            <span>{shipment.carrier}</span>
          </div>
          <div className="detail-item">
            <span>Shipped:</span>
            <span>{new Date(shipment.shipment_date).toLocaleDateString()}</span>
          </div>
          <div className="detail-item">
            <span>ETA:</span>
            <span>{new Date(shipment.estimated_delivery).toLocaleDateString()}</span>
          </div>
          <div className="detail-item">
            <span>Client:</span>
            <span>{shipment.orders?.profiles?.company || 'N/A'}</span>
          </div>
        </div>

        {shipment.status === 'in_transit' && (
          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${shipment.progress}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {Math.round(shipment.progress)}% Complete
            </div>
          </div>
        )}

        {shipment.notes && (
          <div className="notes-section">
            <strong>Notes:</strong> {shipment.notes}
          </div>
        )}
      </div>
    </div>
  );

  const renderShipmentList = () => (
    <div className="shipment-list-panel">
      <h4>
        <FaGlobeAmericas /> Active Shipments ({shipments.length})
      </h4>
      
      <div className="shipment-filters">
        <span className="filter-label">Filter by:</span>
        <select className="filter-select">
          <option value="all">All Shipments</option>
          <option value="in_transit">In Transit</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delayed">Delayed</option>
        </select>
      </div>

      <div className="shipments-container">
        {shipments.map(shipment => (
          <div 
            key={shipment.id}
            className={`shipment-card ${shipment.status} ${selectedShipment?.id === shipment.id ? 'selected' : ''}`}
            onClick={() => handleShipmentClick(shipment)}
          >
            <div className="shipment-header">
              <span className="tracking-number">
                #{shipment.tracking_number}
              </span>
              <span className={`status-indicator ${shipment.status}`}>
                {shipment.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="shipment-route">
              <span className="origin">{shipment.origin}</span>
              <span className="arrow">→</span>
              <span className="destination">{shipment.destination}</span>
            </div>
            
            <div className="shipment-meta">
              <span className="carrier">
                <i className={`fa ${getCarrierIcon(shipment.carrierType)}`}></i>
                {shipment.carrier}
              </span>
              <span className="eta">
                ETA: {new Date(shipment.estimated_delivery).toLocaleDateString()}
              </span>
            </div>

            {shipment.status === 'in_transit' && (
              <div className="shipment-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${shipment.progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{Math.round(shipment.progress)}%</span>
              </div>
            )}

            {shipment.urgency === 'high' && (
              <div className="urgency-alert">
                <FaExclamationTriangle /> Urgent Delivery
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="map-container glass-card">
        <div className="map-header">
          <h3><FaGlobeAmericas /> Live Global Shipment Tracking</h3>
          <div className="map-loading">
            <div className="loading-spinner"></div>
            <span>Loading real-time shipment data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container glass-card">
      <div className="map-header">
        <h3><FaGlobeAmericas /> Live Global Shipment Tracking</h3>
        <div className="map-stats">
          <div className="stat-item">
            <FaTruck className="icon in-transit" />
            <span>{shipments.filter(s => s.status === 'in_transit').length} In Transit</span>
          </div>
          <div className="stat-item">
            <FaClock className="icon out-for-delivery" />
            <span>{shipments.filter(s => s.status === 'out_for_delivery').length} Out for Delivery</span>
          </div>
          <div className="stat-item">
            <FaExclamationTriangle className="icon delayed" />
            <span>{shipments.filter(s => s.status === 'delayed').length} Delayed</span>
          </div>
          <div className="stat-item">
            <FaCheckCircle className="icon delivered" />
            <span>{shipments.filter(s => s.status === 'delivered').length} Delivered Today</span>
          </div>
        </div>
      </div>

      <div className="map-content">
        <div className="map-wrapper">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '600px', width: '100%', borderRadius: '12px' }}
            className="shipment-map"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {shipments.map((shipment) => (
              <React.Fragment key={shipment.id}>
                {/* Origin Marker */}
                <Marker 
                  position={shipment.originCoords}
                  icon={createCustomIcon(shipment.carrierType, 'pending', 'low')}
                >
                  <Popup>
                    {renderShipmentPopup(shipment)}
                  </Popup>
                  <Tooltip permanent direction="top">
                    <div className="tooltip-content">
                      <strong>Origin:</strong> {shipment.origin}
                    </div>
                  </Tooltip>
                </Marker>

                {/* Destination Marker */}
                <Marker 
                  position={shipment.destinationCoords}
                  icon={createCustomIcon(shipment.carrierType, 'delivered', 'low')}
                >
                  <Popup>
                    {renderShipmentPopup(shipment)}
                  </Popup>
                  <Tooltip permanent direction="top">
                    <div className="tooltip-content">
                      <strong>Destination:</strong> {shipment.destination}
                    </div>
                  </Tooltip>
                </Marker>

                {/* Current Location Marker (for in-transit shipments) */}
                {shipment.status === 'in_transit' && (
                  <Marker 
                    position={shipment.currentCoords}
                    icon={createCustomIcon(shipment.carrierType, shipment.status, shipment.urgency)}
                  >
                    <Popup>
                      {renderShipmentPopup(shipment)}
                    </Popup>
                    <Tooltip permanent direction="top">
                      <div className="tooltip-content">
                        <strong>Current Location</strong><br/>
                        Progress: {Math.round(shipment.progress)}%
                      </div>
                    </Tooltip>
                  </Marker>
                )}

                {/* Route Line */}
                <Polyline
                  positions={[shipment.originCoords, shipment.destinationCoords]}
                  color={getStatusColor(shipment.status)}
                  weight={3}
                  opacity={0.7}
                  dashArray={shipment.status === 'in_transit' ? '10, 10' : '5, 5'}
                />

                {/* Progress Marker along the route */}
                {shipment.status === 'in_transit' && (
                  <CircleMarker
                    center={shipment.currentCoords}
                    radius={8}
                    fillColor={getStatusColor(shipment.status)}
                    fillOpacity={0.8}
                    stroke={false}
                  />
                )}
              </React.Fragment>
            ))}
          </MapContainer>
        </div>

        {renderShipmentList()}
      </div>

      {/* Selected Shipment Details Panel */}
      {selectedShipment && (
        <div className="shipment-details-panel">
          <div className="panel-header">
            <h4>Shipment Details</h4>
            <button 
              className="close-button"
              onClick={() => setSelectedShipment(null)}
            >
              ×
            </button>
          </div>
          {renderShipmentPopup(selectedShipment)}
        </div>
      )}
    </div>
  );
};

export default ShipmentMap;