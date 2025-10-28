const EventEmitter = require('events');

class SSEEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.clients = new Set();
  }

  addClient(res, userId = null, role = null) {
    const client = { res, userId, role, connectedAt: new Date() };
    this.clients.add(client);
    
    console.log(`📡 SSE client connected - User: ${userId}, Role: ${role}. Total clients: ${this.clients.size}`);
    
    return client;
  }

  removeClient(client) {
    const duration = client.connectedAt ? Date.now() - client.connectedAt.getTime() : 0;
    this.clients.delete(client);
    console.log(`📡 SSE client disconnected - User: ${client.userId}, Role: ${client.role}, Duration: ${Math.round(duration/1000)}s. Total clients: ${this.clients.size}`);
  }

  broadcastToAll(event, data) {
    const message = this.formatSSEMessage(event, data);
    let successCount = 0;
    let errorCount = 0;
    
    this.clients.forEach(client => {
      try {
        client.res.write(message);
        successCount++;
      } catch (error) {
        console.error(`❌ Error broadcasting to client (User: ${client.userId}, Role: ${client.role}):`, error.message);
        this.removeClient(client);
        errorCount++;
      }
    });
    
    if (errorCount > 0) {
      console.log(`📢 Broadcast complete - Event: ${event}, Success: ${successCount}, Errors: ${errorCount}`);
    }
  }

  broadcastToUser(userId, event, data) {
    const message = this.formatSSEMessage(event, data);
    
    this.clients.forEach(client => {
      if (client.userId === userId) {
        try {
          client.res.write(message);
        } catch (error) {
          console.error('Error broadcasting to user:', error);
          this.removeClient(client);
        }
      }
    });
  }

  broadcastToRole(role, event, data) {
    const message = this.formatSSEMessage(event, data);
    
    this.clients.forEach(client => {
      if (client.role === role || role === 'all') {
        try {
          client.res.write(message);
        } catch (error) {
          console.error('Error broadcasting to role:', error);
          this.removeClient(client);
        }
      }
    });
  }

  formatSSEMessage(event, data) {
    return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  }

  sendHeartbeat() {
    const message = this.formatSSEMessage('heartbeat', { timestamp: new Date().toISOString() });
    let aliveCount = 0;
    let deadCount = 0;
    
    this.clients.forEach(client => {
      try {
        client.res.write(message);
        aliveCount++;
      } catch (error) {
        console.error(`❌ Heartbeat failed for client (User: ${client.userId}, Role: ${client.role}):`, error.message);
        this.removeClient(client);
        deadCount++;
      }
    });
    
    if (deadCount > 0 || this.clients.size > 0) {
      console.log(`💓 Heartbeat sent - Alive: ${aliveCount}, Dead removed: ${deadCount}, Total: ${this.clients.size}`);
    }
  }
}

const eventEmitter = new SSEEventEmitter();

// Setup event listeners for business events
eventEmitter.on('new_report', (data) => {
  console.log('📢 Broadcasting new_report event');
  // Broadcast to dispatchers and managerial
  eventEmitter.broadcastToRole('dispatcher', 'new_report', data);
  eventEmitter.broadcastToRole('managerial', 'new_report', data);
});

eventEmitter.on('assigned_task', (data) => {
  console.log('📢 Broadcasting assigned_task event');
  // Broadcast to the assigned user
  eventEmitter.broadcastToUser(data.assignedTo, 'assigned_task', data);
  // Also broadcast to managerial
  eventEmitter.broadcastToRole('managerial', 'assigned_task', data);
});

eventEmitter.on('report_update', (data) => {
  console.log('📢 Broadcasting report_update event');
  // Broadcast to all roles
  eventEmitter.broadcastToRole('all', 'report_update', data);
});

// Heartbeat to keep connections alive (every 30 seconds)
setInterval(() => {
  eventEmitter.sendHeartbeat();
}, 30000);

module.exports = eventEmitter;
