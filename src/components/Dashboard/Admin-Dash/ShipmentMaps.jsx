// src/components/Dashboard/Admin-Dash/ShipmentMap.jsx
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// import marker assets so Vite/webpack bundles them locally
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

import {
  FaMapMarkerAlt, FaShip, FaPlane, FaTruck, FaSync, FaDownload,
  FaSearch, FaBell, FaClock, FaFileAlt, FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa';
import supabase from '../../../supabaseClient';
import { toast } from 'react-hot-toast';

// Fix leaflet default icon path resolution
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DEFAULT_CENTER = [19.0760, 72.8777]; // Mumbai fallback

function PanToMarker({ coords }) {
  const map = useMap();
  React.useEffect(() => {
    if (coords && coords.length === 2) {
      map.flyTo(coords, 6, { duration: 1.0 });
    }
  }, [coords, map]);
  return null;
}

/* ------------------
   Timeline Modal
   ------------------ */
const TimelineModal = ({ open, onClose, shipmentId, orderId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const buildEvents = (shipment, exportOrder, documents, logs) => {
    const ev = [];

    // Shipment events
    if (shipment?.created_at) ev.push({ ts: shipment.created_at, title: 'Shipment Created', detail: `Shipment record created`, icon: FaFileAlt });
    if (shipment?.shipment_date) ev.push({ ts: shipment.shipment_date, title: 'Shipment Date', detail: `Shipment scheduled`, icon: FaTruck });
    if (shipment?.estimated_delivery) ev.push({ ts: shipment.estimated_delivery, title: 'Estimated Delivery', detail: `Estimated delivery`, icon: FaClock });
    if (shipment?.actual_delivery) ev.push({ ts: shipment.actual_delivery, title: 'Actual Delivery', detail: `Shipment delivered`, icon: FaCheckCircle });
    if (shipment?.status) ev.push({ ts: shipment.updated_at || shipment.created_at, title: `Shipment Status: ${shipment.status}`, detail: `Status changed to ${shipment.status}`, icon: FaBell });

    // Export order events
    if (exportOrder) {
      if (exportOrder.created_at) ev.push({ ts: exportOrder.created_at, title: 'Export Order Created', detail: `Export order record created (${exportOrder.export_reference || ''})`, icon: FaFileAlt });
      if (exportOrder.estimated_departure) ev.push({ ts: exportOrder.estimated_departure, title: 'Estimated Departure', detail: `Estimated departure`, icon: FaPlane });
      if (exportOrder.actual_departure) ev.push({ ts: exportOrder.actual_departure, title: 'Actual Departure', detail: `Departed`, icon: FaPlane });
      if (exportOrder.estimated_arrival) ev.push({ ts: exportOrder.estimated_arrival, title: 'Estimated Arrival', detail: `Estimated arrival`, icon: FaShip });
      if (exportOrder.actual_arrival) ev.push({ ts: exportOrder.actual_arrival, title: 'Actual Arrival', detail: `Arrived`, icon: FaShip });
      if (exportOrder.completed_at) ev.push({ ts: exportOrder.completed_at, title: 'Export Completed', detail: `Order marked completed`, icon: FaCheckCircle });
      // Payment event
      if (Number(exportOrder.amount_received || 0) > 0) {
        ev.push({ ts: exportOrder.updated_at || exportOrder.created_at || new Date().toISOString(), title: 'Payment Received', detail: `Amount received: ${exportOrder.amount_received}`, icon: FaCheckCircle });
      }
    }

    // Documents
    (documents || []).forEach(doc => {
      if (doc.submitted_date) ev.push({ ts: doc.submitted_date, title: `Document Submitted: ${doc.document_type || doc.document_name}`, detail: doc.document_name || doc.document_type, icon: FaFileAlt, file_url: doc.file_url });
      if (doc.approved_date) ev.push({ ts: doc.approved_date, title: `Document Approved: ${doc.document_type || doc.document_name}`, detail: doc.document_name || doc.document_type, icon: FaCheckCircle, file_url: doc.file_url });
    });

    // System logs (filter relevant ones)
    (logs || []).forEach(l => {
      if (l.created_at && l.message) ev.push({ ts: l.created_at, title: `Log: ${l.level}`, detail: l.message, icon: l.level === 'error' ? FaExclamationTriangle : FaFileAlt });
    });

    // normalize, parse timestamps and sort descending
    const normalized = ev
      .map(e => ({ ...e, tsISO: new Date(e.ts).toISOString(), tsNum: new Date(e.ts).getTime() }))
      .sort((a,b) => b.tsNum - a.tsNum);

    return normalized;
  };

  const fetchTimeline = async () => {
    if (!shipmentId && !orderId) return;
    setLoading(true);
    try {
      // Fetch shipment
      const { data: shipmentData, error: shipmentErr } = shipmentId ? await supabase.from('shipments_with_location').select('*').eq('id', shipmentId).single() : { data: null, error: null };

      if (shipmentErr) {
        console.warn('Shipment fetch failed', shipmentErr);
        await supabase.from('system_logs').insert([{ level:'warning', message:`Shipment fetch failed in Timeline: ${shipmentErr.message}`, component:'ShipmentMap', created_at: new Date().toISOString() }]);
      }
      const shipment = shipmentData || null;

      // Fetch export order - by order_id if provided, else try to match shipment.order_id
      const matchOrderId = orderId || shipment?.order_id || null;
      let exportOrder = null;
      if (matchOrderId) {
        const { data: eoData, error: eoErr } = await supabase.from('export_orders').select('*').or(`order_id.eq.${matchOrderId},id.eq.${matchOrderId}`).limit(1).single().catch(e => ({ data: null, error: e }));
        if (eoErr) {
          // maybe missing relation — log and continue
          console.warn('Export order fetch warning', eoErr);
          await supabase.from('system_logs').insert([{ level:'warning', message:`export_orders fetch warning in Timeline: ${eoErr.message}`, component:'ShipmentMap', created_at: new Date().toISOString() }]);
          exportOrder = null;
        } else {
          exportOrder = eoData || null;
        }
      }

      // documents linked to export order (if we have export_order.id)
      let documents = [];
      if (exportOrder?.id) {
        const { data: docsData, error: docsErr } = await supabase.from('export_documents').select('*').eq('export_order_id', exportOrder.id).order('submitted_date', { ascending: true });
        if (docsErr) {
          console.warn('export_documents fetch warning', docsErr);
        } else {
          documents = docsData || [];
        }
      }

      // system logs referencing shipmentId or matchOrderId (ilike on message)
      let logs = [];
      try {
        const searchTerm = shipmentId || matchOrderId;
        if (searchTerm) {
          const { data: logsData, error: logsErr } = await supabase.from('system_logs')
            .select('*')
            .ilike('message', `%${searchTerm}%`)
            .order('created_at', { ascending: false })
            .limit(50);
          if (!logsErr) logs = logsData || [];
        }
      } catch (err) {
        console.warn('system_logs fetch fail', err);
      }

      const built = buildEvents(shipment, exportOrder, documents, logs);
      setEvents(built);

      // audit
      await supabase.from('system_logs').insert([{ level:'info', message:`Timeline loaded for shipment ${shipmentId || ''} / order ${matchOrderId || ''}`, component:'ShipmentMap', created_at: new Date().toISOString() }]);
    } catch (err) {
      console.error('fetchTimeline failed', err);
      toast.error('Failed to load timeline');
      try { await supabase.from('system_logs').insert([{ level:'error', message:`fetchTimeline failed: ${String(err)}`, component:'ShipmentMap', created_at: new Date().toISOString() }]); } catch {}
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (open) fetchTimeline();
    else setEvents([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, shipmentId, orderId]);

  const exportTimelineCSV = () => {
    if (!events || events.length === 0) { toast('No events to export'); return; }
    const headers = ['timestamp','title','detail'];
    const rows = events.map(e => [e.tsISO, e.title, e.detail || '']);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `timeline-${shipmentId || orderId || 'unknown'}-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
    toast.success('Timeline CSV exported');
  };

  if (!open) return null;

  return (
    <div className="modal-overlay timeline-modal">
      <div className="modal-content large">
        <div className="modal-header">
          <h3>Shipment Timeline {shipmentId ? `- ${shipmentId.slice(0,8)}` : ''}</h3>
          <div style={{display:'flex', gap:8}}>
            <button className="btn small" onClick={exportTimelineCSV}><FaDownload /> Export CSV</button>
            <button className="btn small" onClick={() => onClose()}>Close</button>
          </div>
        </div>

        <div className="modal-body" style={{maxHeight: '60vh', overflowY:'auto', padding:12}}>
          {loading && <div className="muted">Loading timeline...</div>}
          {!loading && (!events || events.length === 0) && <div className="muted">No timeline events found for this shipment/order.</div>}
          {!loading && events && events.length > 0 && (
            <div className="timeline-list">
              {events.map((ev, idx) => (
                <div key={idx} className="timeline-row">
                  <div className="timeline-time">{new Date(ev.tsISO).toLocaleString()}</div>
                  <div className="timeline-dot"><ev.icon /></div>
                  <div className="timeline-body">
                    <div className="timeline-title">{ev.title}</div>
                    <div className="timeline-detail">{ev.detail}</div>
                    {ev.file_url && (
                      <div style={{marginTop:6}}>
                        <a className="link-small" href={ev.file_url} target="_blank" rel="noreferrer">Open Document</a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------
   ShipmentMap (main)
   ------------------ */
const ShipmentMap = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);

  // timeline modal state
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [timelineShipmentId, setTimelineShipmentId] = useState(null);
  const [timelineOrderId, setTimelineOrderId] = useState(null);
  const realtimeChannelRef = useRef(null);

  const countryCentroids = useMemo(() => ({
    india: [20.5937, 78.9629], usa: [37.0902, -95.7129], united_states: [37.0902, -95.7129],
    uae: [23.4241, 53.8478], uk: [55.3781, -3.4360], germany: [51.1657, 10.4515],
    france: [46.6034, 1.8883], japan: [36.2048, 138.2529], australia: [-25.2744, 133.7751],
    canada: [56.1304, -106.3468], netherlands: [52.1326, 5.2913], china: [35.8617, 104.1954]
  }), []);

  const getCountryCoords = (country) => {
    if (!country) return DEFAULT_CENTER;
    const key = String(country).trim().toLowerCase().replace(/\s+/g,'_');
    return countryCentroids[key] || DEFAULT_CENTER;
  };

  const parseCoordinates = (value) => {
    if (!value) return null;
    if (typeof value === 'object' && value.lat && value.lng) return [Number(value.lat), Number(value.lng)];
    const s = String(value).trim();
    if (s.includes(',')) {
      const parts = s.split(',').map(p => p.trim());
      const lat = Number(parts[0]); const lng = Number(parts[1]);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) return [lat, lng];
    }
    return null;
  };

  const shippingIcon = (method) => {
    const size = [30, 30];
    const m = String(method || '').toLowerCase();
    if (m.includes('air')) return new Icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png', iconSize: size });
    if (m.includes('sea') || m.includes('ocean')) return new Icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/1995/1995574.png', iconSize: size });
    if (m.includes('truck') || m.includes('road')) return new Icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/2965/2965567.png', iconSize: size });
    return new Icon.Default();
  };

  const humanStatus = (s) => String(s || '').replace(/_/g,' ').toUpperCase() || 'UNKNOWN';

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const { data: shipmentsData, error: shipmentsError } = await supabase
        .from('shipments')
        .select('id,order_id,tracking_number,carrier,shipment_date,estimated_delivery,actual_delivery,status,current_location,created_at,updated_at')
        .order('created_at', { ascending: false })
        .limit(500);

      if (shipmentsError) {
        console.error('shipments fetch error', shipmentsError);
        await supabase.from('system_logs').insert([{ level:'error', message:`shipments fetch failed: ${shipmentsError.message}`, component:'ShipmentMap', created_at: new Date().toISOString() }]);
        toast.error('Failed to load shipments (check logs)');
        setShipments([]);
        setLoading(false);
        return;
      }

      // fetch export_orders linked by order_id (bulk)
      const orderIds = Array.from(new Set((shipmentsData || []).map(s => s.order_id).filter(Boolean)));
      let exportOrdersData = [];
      if (orderIds.length > 0) {
        const { data: eoData, error: eoErr } = await supabase
         .from('export_orders')
         .select(`
          id,
          order_id,
          export_reference,
          port_of_discharge,
          estimated_departure,
          estimated_arrival,
          actual_departure,
          actual_arrival,
          amount_received,
          created_at,
          updated_at
          `)
         .in('order_id', orderIds)
         .limit(1000);
        if (eoErr) {
          console.warn('export_orders fetch warning', eoErr);
          await supabase.from('system_logs').insert([{ level:'warning', message:`export_orders fetch warning: ${eoErr.message}`, component:'ShipmentMap', created_at: new Date().toISOString() }]);
        } else {
          exportOrdersData = eoData || [];
        }
      }

      const enriched = (shipmentsData || []).map(s => {
        const linked = exportOrdersData.find(e => String(e.order_id) === String(s.order_id)) || {};
        const parsedCoords = parseCoordinates(s.current_location || linked.current_location);
        const destCountry = linked.port_of_discharge || linked.destination || null;
        const coords = parsedCoords || getCountryCoords(destCountry);
        return {
          id: s.id,
          order_id: s.order_id,
          tracking_number: s.tracking_number,
          carrier: s.carrier,
          shipment_date: s.shipment_date,
          estimated_arrival: s.estimated_delivery || linked.estimated_arrival,
          actual_delivery: s.actual_delivery || linked.actual_arrival,
          status: s.status,
          current_location: s.current_location || (destCountry ? destCountry : ''),
          destination: destCountry || '',
          export_reference: linked.export_reference || '',
          amount_received: linked.amount_received || 0,
          coordinates: coords,
          raw: { shipment: s, export_order: linked }
        };
      });

      setShipments(enriched);
      await supabase.from('system_logs').insert([{ level:'info', message:`Loaded ${enriched.length} shipments for map`, component:'ShipmentMap', created_at: new Date().toISOString() }]);
    } catch (err) {
      console.error('fetchShipments unexpected', err);
      toast.error('Unexpected error loading shipments');
      try { await supabase.from('system_logs').insert([{ level:'error', message:`fetchShipments unexpected: ${String(err)}`, component:'ShipmentMap', created_at: new Date().toISOString() }]); } catch {}
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  // realtime subscription handlers (only when enabled)
  const enableRealtime = async () => {
    if (realtimeChannelRef.current) return;
    try {
      const channel = supabase.channel('public:shipments_changes');
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'shipments' }, () => fetchShipments().catch(()=>{}));
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'export_orders' }, () => fetchShipments().catch(()=>{}));
      await channel.subscribe();
      realtimeChannelRef.current = channel;
      await supabase.from('system_logs').insert([{ level:'info', message:'ShipmentMap realtime subscribed', component:'ShipmentMap', created_at: new Date().toISOString() }]);
    } catch (err) {
      console.error('enableRealtime failed', err);
      toast.error('Realtime subscription failed');
    }
  };

  const disableRealtime = async () => {
    try {
      if (realtimeChannelRef.current) {
        await realtimeChannelRef.current.unsubscribe();
        realtimeChannelRef.current = null;
        await supabase.from('system_logs').insert([{ level:'info', message:'ShipmentMap realtime unsubscribed', component:'ShipmentMap', created_at: new Date().toISOString() }]);
      }
    } catch (err) {
      console.error('disableRealtime failed', err);
    }
  };

  // initial load
  useEffect(() => {
    fetchShipments();
    return () => {
      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.unsubscribe();
        realtimeChannelRef.current = null;
      }
    };
  }, []);

  // toggle realtime side-effect
  useEffect(() => {
    if (realtimeEnabled) enableRealtime();
    else disableRealtime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realtimeEnabled]);

  // filter & search
  const filtered = useMemo(() => {
    let list = shipments || [];
    if (statusFilter !== 'all') list = list.filter(s => String(s.status || '').toLowerCase() === statusFilter);
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(s => (s.tracking_number || '').toLowerCase().includes(q) ||
        (s.order_id || '').toLowerCase().includes(q) ||
        (s.destination || '').toLowerCase().includes(q) ||
        (s.carrier || '').toLowerCase().includes(q));
    }
    return list;
  }, [shipments, statusFilter, search]);

  const exportCSV = (items) => {
    try {
      if (!items || items.length === 0) { toast('No shipments to export'); return; }
      const headers = ['shipment_id','order_id','tracking_number','status','destination','current_location','estimated_arrival','carrier','amount_received'];
      const rows = items.map(it => [
        it.id, it.order_id || '', it.tracking_number || '', it.status || '', it.destination || '', it.current_location || '', it.estimated_arrival ? new Date(it.estimated_arrival).toISOString() : '', it.carrier || '', it.amount_received || 0
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `shipments-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch (err) {
      console.error('CSV export failed', err);
      toast.error('Export failed');
    }
  };

  // open timeline modal for a chosen shipment
  const openTimeline = (shipment) => {
    setTimelineShipmentId(shipment.id);
    setTimelineOrderId(shipment.order_id || null);
    setTimelineOpen(true);
  };

  if (loading) {
    return (
      <div className="shipment-map glass-card">
        <div className="map-header">
          <h3><FaMapMarkerAlt /> Live Shipment Tracking</h3>
          <div className="loading-state"><div className="loading-spinner"></div><span>Loading shipment data...</span></div>
        </div>
      </div>
    );
  }

  return (
    <div className="shipment-map glass-card">
      <div className="map-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <h3 style={{margin:0}}><FaMapMarkerAlt /> Live Shipment Tracking</h3>
          <div className="muted" style={{fontSize:12}}>Real data from Supabase</div>
        </div>

        <div className="map-controls" style={{display:'flex', gap:8, alignItems:'center'}}>
          <input placeholder="Search tracking / order / dest" value={search} onChange={(e)=>setSearch(e.target.value)} />
          <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
            <option value="all">All status</option>
            <option value="shipped">Shipped</option>
            <option value="in_transit">In Transit</option>
            <option value="delayed">Delayed</option>
            <option value="customs_clearance">Customs</option>
            <option value="delivered">Delivered</option>
          </select>

          <button className="btn" onClick={() => { fetchShipments(); toast.success('Refreshed'); }} title="Refresh"><FaSync /></button>
          <button className="btn" onClick={() => exportCSV(filtered)} title="Export CSV"><FaDownload /></button>
          <label style={{display:'inline-flex', alignItems:'center', gap:8}}>
            <input type="checkbox" checked={realtimeEnabled} onChange={(e)=>setRealtimeEnabled(e.target.checked)} />
            <span style={{fontSize:12}}>Realtime</span>
          </label>
        </div>
      </div>

      <div className="map-body" style={{display:'grid', gridTemplateColumns: '1fr 360px', gap: 16}}>
        <div className="map-container" style={{height: 560}}>
          <MapContainer center={DEFAULT_CENTER} zoom={3} style={{height:'100%', width:'100%'}} scrollWheelZoom>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
            {filtered.map(sh => (
              <React.Fragment key={sh.id}>
                <Marker position={sh.coordinates || DEFAULT_CENTER} icon={shippingIcon(sh.shipping_method)}>
                  <Popup>
                    <div style={{minWidth:240}}>
                      <h4 style={{margin:'4px 0'}}>{sh.tracking_number || `SH-${String(sh.id).slice(0,8)}`}</h4>
                      <div><strong>Order:</strong> {sh.order_id || '—'}</div>
                      <div><strong>Destination:</strong> {sh.destination || '—'}</div>
                      <div><strong>Status:</strong> <span style={{fontWeight:700}}>{humanStatus(sh.status)}</span></div>
                      {sh.estimated_arrival && <div><strong>ETA:</strong> {new Date(sh.estimated_arrival).toLocaleString()}</div>}
                      <div style={{marginTop:8, display:'flex', gap:8}}>
                        <Link to={`/admin/shipments/${sh.id}`} className="btn small">Open</Link>
                        <Link to={`/admin/export-orders/${sh.order_id}`} className="btn small">ExportOrder</Link>
                        <button className="btn small" onClick={() => { setSelectedCoords(sh.coordinates); toast.info('Focusing map'); }}>Focus</button>
                        <button className="btn small" onClick={() => openTimeline(sh)}>Timeline</button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
                {Array.isArray(sh.coordinates) && sh.coordinates.length === 2 && (
                  <Polyline positions={[DEFAULT_CENTER, sh.coordinates]} color="#2A7AE2" weight={1} opacity={0.4} />
                )}
              </React.Fragment>
            ))}
            {selectedCoords && <PanToMarker coords={selectedCoords} />}
          </MapContainer>
        </div>

        <aside className="shipments-panel">
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <h4 style={{margin:0}}>Active Shipments ({filtered.length})</h4>
            <div style={{fontSize:12, color:'#666'}}><FaBell /> {new Date().toLocaleTimeString()}</div>
          </div>

          <div className="shipments-list" style={{marginTop:12, overflowY:'auto', maxHeight:500}}>
            {filtered.map(s => (
              <div key={s.id} className="shipment-card" style={{borderBottom:'1px solid #eee', padding:'10px 0'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:700}}>{s.tracking_number || `SH-${String(s.id).slice(0,8)}`}</div>
                    <div style={{fontSize:12, color:'#555'}}>{s.destination || '—'}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontWeight:700}}>{humanStatus(s.status)}</div>
                    <div style={{fontSize:12, color:'#666'}}>{s.carrier || '—'}</div>
                  </div>
                </div>

                <div style={{marginTop:8, display:'flex', gap:8, alignItems:'center'}}>
                  <button className="btn small" onClick={() => { setSelectedCoords(s.coordinates); toast.success('Map focused'); }}>Focus</button>
                  <Link to={`/admin/shipments/${s.id}`} className="btn small">Details</Link>
                  <button className="btn small" onClick={() => exportCSV([s])}>Export</button>
                  <button className="btn small" onClick={() => openTimeline(s)}>Timeline</button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="muted" style={{padding:12}}>No shipments matching filters.</div>}
          </div>
        </aside>
      </div>

      {/* Timeline Modal */}
      <TimelineModal
        open={timelineOpen}
        onClose={() => setTimelineOpen(false)}
        shipmentId={timelineShipmentId}
        orderId={timelineOrderId}
      />

       <style jsx>{`
        .shipment-map { padding: 16px; border-radius: 12px; }
        .shipment-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; gap:12px; }
        .shipment-header h3 { margin:0; display:flex; gap:8px; align-items:center; font-size:18px; }
        .header-actions { display:flex; gap:8px; align-items:center; }
        .search-box { display:flex; gap:8px; align-items:center; background:var(--glass, #ffffff10); padding:6px 8px; border-radius:8px; }
        .search-box input { border:0; background:transparent; outline:none; min-width:220px; color:inherit; }
        .btn { padding:6px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.06); background:transparent; cursor:pointer; display:inline-flex; gap:8px; align-items:center; }
        .btn.loading { opacity:0.7; pointer-events:none; }
        .export-group { display:flex; gap:4px; }
        .timeline { display:flex; flex-direction:column; gap:10px; max-height:640px; overflow:auto; padding-right:6px; }
        .timeline-item { display:flex; gap:10px; }
        .timeline-marker { width:12px; height:12px; border-radius:50%; margin-top:6px; flex:0 0 12px; background:#999; }
        .status-in_transit { background: #3b82f6; } /* blue */
        .status-delayed { background: #f97316; } /* orange */
        .status-delivered { background: #10b981; } /* green */
        .timeline-body { background: rgba(255,255,255,0.02); padding:10px; border-radius:8px; flex:1; display:flex; flex-direction:column; gap:8px; }
        .timeline-row { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
        .title { font-weight:600; }
        .carrier { font-weight:400; color:var(--muted); margin-left:6px; }
        .muted { color: #9ca3af; font-size:13px; }
        .status { padding:6px 8px; border-radius:6px; font-weight:700; background: rgba(255,255,255,0.03); }
        .timeline-actions { display:flex; gap:6px; }
        .loading-state, .error-state { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:24px; }
        /* modal */
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:1200; padding:20px; }
        .modal { background:var(--panel,#0b1220); padding:16px; border-radius:10px; width:min(900px,98%); max-height:90vh; overflow:auto; }
        .modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
        .detail-table td { padding:8px 12px; border-bottom:1px dashed rgba(255,255,255,0.02); }
        @media (max-width:800px) {
          .header-actions { flex-direction:column; align-items:stretch; }
          .search-box input { min-width:120px; }
        }
      `}</style>

    </div>
  );
};

export default ShipmentMap;
