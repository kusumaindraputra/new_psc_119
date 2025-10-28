const eventEmitter = require('./eventEmitter');

const streamEvents = (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for nginx
  
  res.flushHeaders();

  // Get user info from authenticated request
  const userId = req.userId || null;
  const role = req.user?.role || null;
  const clientIP = req.ip || req.connection.remoteAddress;

  console.log(`[SSE] New connection - User: ${userId}, Role: ${role}, IP: ${clientIP}`);

  // Add client to SSE manager
  const client = eventEmitter.addClient(res, userId, role);

  // Send initial connection message
  res.write(`event: connected\ndata: ${JSON.stringify({ 
    message: 'Connected to PSC 119 event stream',
    timestamp: new Date().toISOString()
  })}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    console.log(`[SSE] Client disconnected - User: ${userId}, Role: ${role}, IP: ${clientIP}, Reason: Client closed connection`);
    eventEmitter.removeClient(client);
    res.end();
  });

  // Handle errors
  req.on('error', (error) => {
    console.error(`[SSE] Connection error - User: ${userId}, Role: ${role}, IP: ${clientIP}`, error);
    eventEmitter.removeClient(client);
    res.end();
  });

  res.on('error', (error) => {
    console.error(`[SSE] Response error - User: ${userId}, Role: ${role}, IP: ${clientIP}`, error);
    eventEmitter.removeClient(client);
    res.end();
  });

  // Set timeout (optional, configured from env)
  const timeout = parseInt(process.env.SSE_TIMEOUT) || 300000; // 5 minutes default
  setTimeout(() => {
    console.log(`[SSE] Connection timeout - User: ${userId}, Role: ${role}, IP: ${clientIP}, Timeout: ${timeout}ms`);
    eventEmitter.removeClient(client);
    res.end();
  }, timeout);
};

module.exports = { streamEvents };
