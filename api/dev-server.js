import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ==================== VERCEL API ROUTE SIMULATOR ====================

// Get all .js files in api folder
const apiFiles = fs.readdirSync(__dirname)
  .filter(file => file.endsWith('.js') && file !== 'dev-server.js')
  .map(file => file.replace('.js', ''));

console.log('📂 Detected API files:', apiFiles);

// Dynamically import and mount all API routes
const mountedRoutes = [];

for (const apiFile of apiFiles) {
  try {
    const modulePath = `./${apiFile}.js`;
    const module = await import(modulePath);
    
    // Vercel expects default export as handler function
    if (module.default && typeof module.default === 'function') {
      const routePath = `/api/${apiFile}`;
      
      // Mount the route (supports both GET and POST)
      app.all(routePath, async (req, res) => {
        try {
          // Vercel passes (req, res) directly to the handler
          await module.default(req, res);
        } catch (error) {
          console.error(`Error in ${apiFile}:`, error);
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              error: error.message,
              route: routePath
            });
          }
        }
      });
      
      mountedRoutes.push({ route: routePath, file: apiFile, status: '✅' });
    } else {
      mountedRoutes.push({ route: `/api/${apiFile}`, file: apiFile, status: '❌ No default export' });
    }
  } catch (error) {
    mountedRoutes.push({ route: `/api/${apiFile}`, file: apiFile, status: `❌ ${error.message}` });
  }
}

// ==================== ROOT & HEALTH CHECK ====================

app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: '🚀 Local Vercel API Development Server',
    version: '1.0.0',
    environment: 'development',
    port: PORT,
    routes: mountedRoutes.map(r => ({
      route: r.route,
      status: r.status
    }))
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ==================== ERROR HANDLING ====================

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.path,
    availableRoutes: mountedRoutes.map(r => r.route)
  });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal server error',
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║                                               ║');
  console.log(`║   🚀 Vercel API Dev Server (Port ${PORT})      ║`);
  console.log('║                                               ║');
  console.log('╚═══════════════════════════════════════════════╝\n');
  console.log(`📍 Server URL:       http://localhost:${PORT}`);
  console.log(`📍 Health Check:     http://localhost:${PORT}/api/health`);
  console.log(`📍 Environment:      ${process.env.NODE_ENV || 'development'}\n`);
  
  console.log('📋 Mounted API Routes:\n');
  mountedRoutes.forEach(({ route, file, status }) => {
    console.log(`   ${status.includes('✅') ? '✅' : '❌'} ${route.padEnd(40)} (${file}.js)`);
  });
  
  console.log('\n════════════════════════════════════════════════');
  console.log('Press Ctrl+C to stop the server');
  console.log('════════════════════════════════════════════════\n');
});

process.on('SIGINT', () => {
  console.log('\n\n👋 Server shutting down gracefully...');
  process.exit(0);
});

export default app;