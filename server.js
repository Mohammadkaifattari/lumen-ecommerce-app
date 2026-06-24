const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Global pe store karo taake API routes access kar sakein
  global.io = io;

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-admin', () => {
      socket.join('admin-room');
      console.log('Admin joined:', socket.id);
    });

    socket.on('join-chat', ({ roomId }) => {
      socket.join(`chat-${roomId}`);
      console.log(`User joined chat room: chat-${roomId}`);
    });

    socket.on('chat-message', ({ roomId, message }) => {
      // Hamesha admin ko bhejo
      io.to('admin-room').emit('chat-message', { roomId, message });
      // Hamesha us room ke users ko bhejo
      io.to(`chat-${roomId}`).emit('chat-message', { roomId, message });
    });

    socket.on('new-user', (data) => {
      io.to('admin-room').emit('new-user', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  httpServer.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });
});