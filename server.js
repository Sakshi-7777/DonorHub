// ============================================
// Simple HTTP Server for Local Testing
// ============================================

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOSTNAME = 'localhost';

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown'
};

// Create server
const server = http.createServer((req, res) => {
  // Log request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Parse URL
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  let filePath = path.join(__dirname, pathname);

  // Serve login.html for root and index.html requests
  if (pathname === '/' || pathname === '/index.html') {
    pathname = '/login.html';
  }

  filePath = path.join(__dirname, pathname);

  // Get file extension
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  // Read and serve file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // File not found
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>', 'utf-8');
      } else {
        // Server error
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>500 - Server Error</h1>', 'utf-8');
      }
    } else {
      // Success
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block'
      });
      res.end(data, 'utf-8');
    }
  });
});

// Start server
server.listen(PORT, HOSTNAME, () => {
  console.log(`
╔════════════════════════════════════════╗
║     HealthHub Development Server       ║
╚════════════════════════════════════════╝

✅ Server running at: http://${HOSTNAME}:${PORT}
📱 Open in browser: http://localhost:${PORT}

Features:
  ✓ Automatic MIME type detection
  ✓ Security headers enabled
  ✓ Caching configured
  ✓ 404 error handling
  ✓ Console logging

Press Ctrl+C to stop server
  `);
});

// Handle errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.log(`Try: PORT=3001 node server.js`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⏹️  Server shutting down...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});
