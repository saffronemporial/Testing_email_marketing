import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EmailMarketing from '../pages/EmailMarketing';
import EmailDashboard from '../pages/EmailDashboard';
import Subscribers from '../pages/Subscribers';
import EmailTemplates from '../pages/EmailTemplates';
import TemplateEditorPage from '../pages/TemplateEditorPage';
import AIEmailGeneratorPage from '../pages/AIEmailGeneratorPage';
// Import other pages as they are created

const EmailMarketingRoutes = () => {
  return (
    <Routes>
      <Route path="/email-marketing" element={<EmailMarketing />}>
        <Route index element={<EmailDashboard />} />
        <Route path="dashboard" element={<EmailDashboard />} />
        <Route path="subscribers" element={<Subscribers />} />
        <Route path="templates" element={<EmailTemplates />} />
        <Route path="templates/new" element={<TemplateEditorPage />} />
        <Route path="templates/edit/:id" element={<TemplateEditorPage />} />
        <Route path="ai-generator" element={<AIEmailGeneratorPage />} />
        {/* Add more routes as we create components */}
      </Route>
    </Routes>
  );
};

export default EmailMarketingRoutes;