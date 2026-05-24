const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http'); 
const { Server } = require('socket.io'); 
require('dotenv').config();

// --- Imports ---
const authRoutes = require('./routes/authRoutes'); 
const meetingRoutes = require('./routes/meetingRoutes');
const userRoutes = require('./routes/userRoutes'); 
const documentRoutes = require('./routes/documentRoutes');
const messageRoutes = require('./routes/messageRoutes'); 
const Message = require('./models/Message'); 

const app = express();

// --- Wrap Express in an HTTP Server for Socket.io ---
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:5173"], 
        methods: ["GET", "POST"]
    }
});

// --- 1. Middleware ---
app.use(cors());
app.use(express.json()); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 2. Database Connection ---
const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing from the .env file.");
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB successfully connected!');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1); 
    }
};

// --- 3. API Routes ---
app.get('/api/status', (req, res) => res.status(200).json({ status: "success" }));
app.use('/api/auth', authRoutes); 
app.use('/api/meetings', meetingRoutes); 
app.use('/api/users', userRoutes); 
app.use('/api/documents', documentRoutes); 
app.use('/api/messages', messageRoutes); 
app.use('/api/payments', require('./routes/paymentRoutes'));

// --- 4. WebSockets (Live Chat & Video Signaling) ---
io.on('connection', (socket) => {
    console.log(`🔌 A user connected: ${socket.id}`);

    // Join personal room for routing messages and calls
    socket.on('join_room', (userId) => {
        socket.join(userId);
    });

    // --- A. Live Chat Logic ---
    socket.on('send_message', async (data) => {
        try {
            const newMessage = new Message({
                sender: data.senderId,
                receiver: data.receiverId,
                content: data.content
            });
            await newMessage.save();

            io.to(data.receiverId).emit('receive_message', newMessage);
            socket.emit('receive_message', newMessage);
        } catch (error) {
            console.error("Error saving message:", error);
        }
    });

    // --- B. NEW: Video Calling Signaling Logic ---
    
    // 1. Initiating a Call
    socket.on('call_user', (data) => {
        // userToCall is the ID of the person receiving the call
        // signalData contains the caller's video stream info
        // from is the ID of the person making the call
        io.to(data.userToCall).emit('incoming_call', { 
            signal: data.signalData, 
            from: data.from 
        });
    });

    // 2. Answering a Call
    socket.on('answer_call', (data) => {
        // Send the receiver's video stream info back to the caller
        io.to(data.to).emit('call_accepted', data.signal);
    });

    // 3. Ending a Call
    socket.on('end_call', (data) => {
        io.to(data.to).emit('call_ended');
    });

    socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.id}`);
    });
});

// --- 5. Server Initialization ---
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB(); 
    server.listen(PORT, () => {
        console.log(`🚀 Server and WebSockets listening on port ${PORT}`);
    });
};

startServer();