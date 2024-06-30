const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Set CSP headers
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;");
  next();
});

// Serve static files from the 'public' directory
const publicPath = path.join(__dirname, 'public');
console.log(`Serving static files from ${publicPath}`);
app.use(express.static(publicPath));

// Handle the root route to serve index.html
app.get('/', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  console.log(`Serving index.html from ${indexPath}`);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`Error serving index.html: ${err.message}`);
      res.status(500).send("Error serving index.html");
    }
  });
});

// Listen for client connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for 'join' events from the client
  socket.on('join', (username) => {
    socket.username = username;
    console.log(`${username} joined the chat`);
    io.emit('user joined', username);
  });

  // Listen for 'chat message' events from the client
  socket.on('chat message', (msg) => {
    console.log(`Received chat message from ${msg.user}: ${msg.text}`);
    io.emit('chat message', msg);
  });

  // Listen for 'leave' events from the client
  socket.on('leave', (username) => {
    console.log(`${username} left the chat`);
    io.emit('user left', username);
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    if (socket.username) {
      console.log(`${socket.username} disconnected`);
      io.emit('user left', socket.username);
    } else {
      console.log('A user disconnected');
    }
  });
});

// Define the port the server will listen on
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
