import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
const PORT = process.env.PORT || 5000;
const app = express();

// Routes
import authRoutes from './src/routes/auth.routes.js';
import issueRoutes from './src/routes/issue.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import notificationRoutes from './src/routes/notification.routes.js';

dotenv.config();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
// MongoDB

const main = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in .env");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected successfully");
};

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "PUT"],
    credentials: true
  }
});

// Middleware
app.set('socketio', io);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their personal room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check
app.get('/', (req, res) => {
  res.json({ message: 'CivicWatch Bangalore API is running' });
});

main()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is Running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Connection error:", err.message);
  });