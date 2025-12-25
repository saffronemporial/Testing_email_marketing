// src/pages/ExportDetailPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useExport } from '../context/ExportContext';
import PhaseManager from '../components/Export/Core/PhaseManager';
import VendorForm from '../components/Export/Procurement/VendorManager/VendorForm';

const ExportDetailPage = () => {
  const { exportId } = useParams();
  const { selectedExport, fetchExportOrder } = useExport();
  
  React.useEffect(() => {
    if (exportId) {
      fetchExportOrder(exportId);
    }
  }, [exportId, fetchExportOrder]);
  
  if (!selectedExport) {
    return <div>Loading export details...</div>;
  }
  
  return (
    <div>
      <h1>Export Order: {selectedExport.export_reference}</h1>
      {/* Add tabs or navigation to switch between different views */}
      <PhaseManager exportOrderId={exportId} />
      <VendorForm exportOrderId={exportId} />
    </div>
  );
};

export default ExportDetailPage;