const http = require('http');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Server is running' }));
});

// Try to listen on port 5000
server.listen(5000, () => {
  console.log('Test server is running on port 5000');
});

// Handle errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error('Port 5000 is already in use. Another server might be running.');
  } else {
    console.error('Error starting server:', error);
  }
});

// Close the server after 5 seconds
setTimeout(() => {
  server.close(() => {
    console.log('Test server closed');
  });
}, 5000);
