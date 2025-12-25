// src/components/email-marketing/EmailMarketingRoutes.jsx

import { Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import EmailMarketingLayout from "./EmailMarketingLayout";

/* -------------------------------------------------------
   LAZY LOAD ALL EMAIL MARKETING PAGES
   (Prevents slowing down main admin app)
-------------------------------------------------------- */

const EmailOverviewDashboard = lazy(() =>
  import("./dashboards/EmailOverviewDashboard")
);

const SubscriberDashboard = lazy(() =>
  import("./subscribers/SubscriberDashboard")
);

const ProviderHealthFailoverDashboard = lazy(() =>
  import("./providers/ProviderHealthFailoverDashboard")
);
const RateLimitMonitor = lazy(() =>
  import("./limits/RateLimitMonitor")
);
const EmailLogsExplorer = lazy(() =>
  import("./logs/EmailLogsExplorer")
);
const ComplianceSuppressionManager = lazy(() =>
  import("./compliance/ComplianceSuppressionManager")
);
const SystemErrorIncidentCenter = lazy(() =>
  import("./incidents/SystemErrorIncidentCenter")
);

const SubscriberList = lazy(() =>
  import("./subscribers/SubscriberList")
);  
const CampaignCreate = lazy(() =>
  import("./campaigns/CampaignCreate")
);
const CampaignDetail = lazy(() =>
  import("./campaigns/CampaignDetails")
);

const CampaignDashboard = lazy(() =>
  import("./campaigns/CampaignDashboard")
);

const TemplateDashboard = lazy(() =>
  import("./templates/TemplateDashboard")
);
const TemplateEditorForm = lazy(() =>
  import("./templates/TemplateEditorForm")
);

const SubscriberImport = lazy(() =>
  import("./subscribers/SubscriberImport")
);

const CampaignScheduler = lazy(() =>
  import("./scheduling/CampaignScheduler")
);
const CampaignEdit = lazy(() =>
  import("./campaigns/CampaignEdit")
);

const AIDraftDashboard = lazy(() =>
  import("./ai/AIDraftDashboard")
);

const AiPromptToneControl = lazy(() =>
  import("./ai/AiPromptToneControl")
);

const ScheduleDashboard = lazy(() =>
  import("./scheduling/ScheduleDashboard")
);

const ApprovalInbox = lazy(() =>
  import("./approvals/ApprovalInbox")
);

const CampaignAnalyticsDashboard = lazy(() =>
  import("./analytics/CampaignAnalyticsDashboard")
);

const EmailSystemSettings = lazy(() =>
  import("./settings/EmailSystemSettings")
);

/* -------------------------------------------------------
   ROUTE CONFIG (SINGLE SOURCE OF TRUTH)
-------------------------------------------------------- */

const emailRoutesConfig = [
  {
    path: "",
    element: <EmailOverviewDashboard />,
    title: "Email Marketing Overview"
  },
  {
    path: "subscribers",
    element: <SubscriberDashboard />,
    title: "Subscribers"
  },
  {
    path: "campaigns",
    element: <CampaignDashboard />,
    title: "Campaigns"
  },
  {
    path: "templates",
    element: <TemplateDashboard />,
    title: "Templates"
  },
  {
    path: "ai",
    element: <AIDraftDashboard />,
    title: "AI Drafts"
  },
  {
    path: "schedule",
    element: <ScheduleDashboard />,
    title: "Scheduling"
  },
  {
    path: "approvals",
    element: <ApprovalInbox />,
    title: "Approvals",
    adminOnly: true
  },
  {
    path: "analytics",
    element: <CampaignAnalyticsDashboard />,
    title: "Analytics"
  },
  {
    path: "settings",
    element: <EmailSystemSettings />,
    title: "System Settings",
    adminOnly: true
  },
  {
  path: "campaigns/:id/schedule",
  element: <CampaignScheduler />,
  title: "Schedule Campaign"
},
  {
  path: "campaigns/:id/edit",
  element: <CampaignEdit />,
  title: "Edit Campaign"
},
{ 
  path: "subscribers/import",
  element: <SubscriberImport />
}
];
<Route>
  <Route index element={<EmailOverviewDashboard />} />

  <Route path="subscribers" element={<SubscriberDashboard />} />
  <Route path="subscribers/list" element={<SubscriberList />} />

  <Route path="templates" element={<TemplateDashboard />} />
  <Route path="templates/editor/:id" element={<TemplateEditorForm />} />

  <Route path="campaigns" element={<CampaignDashboard />} />
  <Route path="campaigns/create" element={<CampaignCreate />} />
  <Route path="campaigns/:id" element={<CampaignDetail />} />

  <Route path="schedule" element={<ScheduleDashboard />} />
  <Route path="analytics" element={<CampaignAnalyticsDashboard />} />


  <Route path="ai-control" element={<AiPromptToneControl />} />
  <Route path="providers" element={<ProviderHealthFailoverDashboard />} />
  <Route path="rate-limits" element={<RateLimitMonitor />} />
  <Route path="logs" element={<EmailLogsExplorer />} />
  <Route path="compliance" element={<ComplianceSuppressionManager />} />
  <Route path="incidents" element={<SystemErrorIncidentCenter />} />
</Route>

/* -------------------------------------------------------
   ROUTES EXPORT
   (Injected inside /admin route in App.jsx)
-------------------------------------------------------- */

const EmailMarketingRoutes = (
  <Route
    path="email-marketing"
    element={<EmailMarketingLayout />}
  >
    {emailRoutesConfig.map((route) => (
      <Route
        key={route.path || "index"}
        index={route.path === ""}
        path={route.path}
        element={
          <Suspense fallback={<EmailRouteLoader />}>
            {route.element}
          </Suspense>
        }
      />
    ))}
  </Route>
);

export default EmailMarketingRoutes;

/* -------------------------------------------------------
   LOADING FALLBACK (PREMIUM SKELETON)
-------------------------------------------------------- */

function EmailRouteLoader() {
  return (
    <div className="em-route-loader">
      <div className="em-loader-card shimmer" />
      <div className="em-loader-card shimmer" />
      <div className="em-loader-card shimmer" />
    </div>
  );
}
