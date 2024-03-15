const net = require('net');
const crypto = require('crypto');

// Function to perform WebSocket handshake
function performHandshake(socket, key) {
  const acceptKey = crypto.createHash('sha1')
                        .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', 'binary')
                        .digest('base64');
  
  socket.write('HTTP/1.1 101 Switching Protocols\r\n' +
               'Upgrade: websocket\r\n' +
               'Connection: Upgrade\r\n' +
               'Sec-WebSocket-Accept: ' + acceptKey + '\r\n\r\n');
}

// Function to unmask message received from client
function unmaskMessage(mask, maskedData) {
  const unmaskedData = Buffer.alloc(maskedData.length);
  for (let i = 0; i < maskedData.length; i++) {
    unmaskedData[i] = maskedData[i] ^ mask[i % 4];
  }
  return unmaskedData.toString();
}

// Function to format message for sending to client
function formatMessage(message) {
  const opcode = 0x81; // Text frame opcode
  const messageLength = Buffer.byteLength(message);
  let header;
  if (messageLength < 126) {
    header = Buffer.alloc(2);
    header.writeUInt8(opcode, 0);
    header.writeUInt8(messageLength, 1);
  } else if (messageLength < 65536) {
    header = Buffer.alloc(4);
    header.writeUInt8(opcode, 0);
    header.writeUInt8(126, 1);
    header.writeUInt16BE(messageLength, 2);
  } else {
    header = Buffer.alloc(10);
    header.writeUInt8(opcode, 0);
    header.writeUInt8(127, 1);
    header.writeBigUInt64BE(BigInt(messageLength), 2);
  }
  return Buffer.concat([header, Buffer.from(message)]);
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
      ws.onopen = () => ws.send('Hello studass!');
      ws.onerror = (event) => console.log(event);
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

  let handshakeDone = false;
  let key = '';

  connection.on('data', (data) => {
    if (!handshakeDone) {
      // Perform WebSocket handshake if not already done
      const headers = data.toString().split('\r\n');
      const keyHeader = headers.find(header => header.startsWith('Sec-WebSocket-Key'));
      if (keyHeader) {
        key = keyHeader.split(': ')[1];
        performHandshake(connection, key);
        handshakeDone = true;
        let message = "Heisann";
        let response = formatMessage(message);
        connection.write(response);
      }
    } else {
      // Handle WebSocket messages from clients
      const opcode = data[0] & 0x0F;
      if (opcode === 0x8) {
        // Close connection if client sends a close frame
        connection.end();
      } else if (opcode === 0x1) {
        // Text frame received
        const payloadLength = data[1] & 0x7F;
        const mask = data.slice(2, 6);
        const maskedData = data.slice(6);
        const unmaskedData = Buffer.alloc(maskedData.length);
        for (let i = 0; i < maskedData.length; i++) {
          unmaskedData[i] = maskedData[i] ^ mask[i % 4];
        }
        console.log('Message from client: ' + unmaskedData.toString());
      }
    }
  });

  connection.on('end', () => {
    console.log('Client disconnected');
  });
});
wsServer.on('error', (error) => {
  console.error('Error: ', error);
});
wsServer.listen(3001, () => {
  console.log('WebSocket server listening on port 3001');
});
