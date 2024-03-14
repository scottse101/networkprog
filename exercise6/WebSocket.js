const net = require('net');

// Function to perform WebSocket handshake
function performHandshake(socket) {
  socket.write('HTTP/1.1 101 Switching Protocols\r\n' +
               'Upgrade: websocket\r\n' +
               'Connection: Upgrade\r\n' +
               '\r\n');
}

// Maintain a list of connected WebSocket clients
const clients = [];

// Function to broadcast message to all connected clients
function broadcast(message, senderSocket) {
  clients.forEach(client => {
    if (client !== senderSocket) {
      client.write(message);
    }
  });
}

// Simple HTTP server responds with a simple WebSocket client test
const httpServer = net.createServer((connection) => {
  connection.on('data', () => {
    let content = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    Welcome to WebSocket test page!
    <script>
      let ws = new WebSocket('ws://localhost:3001');
      ws.onmessage = event => alert('Message from server: ' + event.data);
      ws.onopen = () => ws.send('hello');
    </script>
  </body>
</html>
`;
    connection.write('HTTP/1.1 200 OK\r\nContent-Length: ' + content.length + '\r\n\r\n' + content);
  });
});
httpServer.listen(3000, () => {
  console.log('HTTP server listening on port 3000');
});

// WebSocket server
const wsServer = net.createServer((connection) => {
  console.log('Client connected');
  
  // Perform WebSocket handshake
  performHandshake(connection);

  // Add client to the list of connected clients
  clients.push(connection);

  connection.on('data', (data) => {
    // Assuming received data is UTF-8 encoded text
    const message = data.toString();
    console.log('Data received from client: ', message);

    // Broadcast the received message to all clients
    broadcast(message, connection);
  });

  connection.on('end', () => {
    console.log('Client disconnected');

    // Remove disconnected client from the list of clients
    const index = clients.indexOf(connection);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
});
wsServer.on('error', (error) => {
  console.error('Error: ', error);
});
wsServer.listen(3001, () => {
  console.log('WebSocket server listening on port 3001');
});
