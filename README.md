# Saffron Emporial Ecosystem — Frontend (React + Supabase)


package.json 
removed depen. which not available by me below
1. "react-simple-calendar": "^0.6.0",



#sub components file which can be used at somewhere in components.
1. admin/invoices


NEED TO REFINE
1. admin/Admin-expense
2. admin/Admin-Analytics
3. "/Admin-products" (pages/AdminProducts)
4. AdminShipmentsPage (/pages)
5. admin/analytics-page" (nothing working just written functions name only showing)
6. /admin/Calculator-Dashboard (make simpple version and then include in public page.) 
7. /admin/AutomationDashboard (refine entire automation system. check edge function and automation system)
8. /admin/analytics-page  (check and refine if needed)
9. admin/supplier-performance (refine codes and then add to sidebar or links in dashboard)
10. admin/compliance-checklist  (refine)
11. admin/customs-manager (refine, uupdate and add more features if needed this file)
12. admin/ai-demand-predictionai-sales-prediction ( refine if needed)
13. /admin/ai-recommendations (refine update add new feature and then add to sidebar or header)
14. admin/notificationsPage/alert/report  (refine and make proper then insert into header and sidebar)
15. admin/company-settings  (refine if needed)
16. admin/document-vault (refine if needed. not neccsry)
17. admin/shipment-map (refine and add)
18. shipment folder/admin/shipment-timeline (refine and add)
19. refine entire Staff folder and its components.
20. admin/ClientShipment (clientshipmentPage refine if needed)
21. refine OrderInvoicePage from admin routing.
22. admin/InventoryDashboard   (refine and check getting error)









## Quickstart
```bash
npm install
npm run dev
```

functions to test locally
2025-11-05T17:13:45.912784072Z Serving functions on http://127.0.0.1:54321/functions/v1/<function-name>
2025-11-05T17:13:45.912876277Z  - http://127.0.0.1:54321/functions/v1/calculate-client-intelligence
2025-11-05T17:13:45.912889378Z  - http://127.0.0.1:54321/functions/v1/health
2025-11-05T17:13:45.912897978Z  - http://127.0.0.1:54321/functions/v1/notifyEmail
2025-11-05T17:13:45.912904779Z  - http://127.0.0.1:54321/functions/v1/process-automation
2025-11-05T17:13:45.912911079Z  - http://127.0.0.1:54321/functions/v1/runFollowUpNotifications

http://127.0.0.1:54321/functions/v1/sendSingle 




vercel.json made by deep

{
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "api/public-contact-email.js": {
      "maxDuration": 10
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
        { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" }
      ]
    }
  ]
}

new one 
{
  "functions": {
    "api/*.js": {
      "runtime": "nodejs18.x"
    }
  }
}


below is index.html 
<!DOCTYPE html>
<html lang="en">
  <head>
  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"></script>
  <style>@view-transition { navigation: auto; }</style>
  <script src="/_sdk/data_sdk.js" type="text/javascript"></script>
  <script src="/_sdk/element_sdk.js" type="text/javascript"></script>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Saffron Emporial</title>
  </head>
  <body>
    <div id="root"></div>
     <script type="module" src="/src/main.jsx"></script>  
    <script>(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'9b0e6cdbe1706e29',t:'MTc2NjIyNjIxNi4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/src/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();</script>
  </body>
</html>
