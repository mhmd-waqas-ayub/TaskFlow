const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const http = require("http");
const { Server } = require("socket.io");
const errorMiddleware = require("./middleware/errorMiddleware");

// ✅ Connect DB FIRST
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ Dynamic CORS Array
const allowedOrigins = [
    "http://localhost:5173",       // Local development frontend
    process.env.FRONTEND_URL       // Future production frontend (will set this in Railway )
];

// ✅ Socket.io CORS Configuration
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true
    }
});
app.set("io", io);

// ✅ Middleware
app.use(express.json());
console.log("Server file loaded successfully");

// ✅ Express CORS Configuration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like Postman or mobile requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");

app.get("/", (req, res) => {
    res.send("Backend is running");
});

app.get("/api/admin", authMiddleware, roleMiddleware("admin"), (req, res) => {
    res.json({ message: "Welcome to Admin Panel" });
});

// ✅ Routes
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use(errorMiddleware);

// ✅ Socket.io Connections
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinProject", (projectId) => {
        socket.join(projectId);
        console.log(`Socket joined projects:${projectId}`);
    });
    
    socket.on("disconnect", () => {
        console.log("User Disconnected");
    });
});


const PORT = process.env.PORT || 5000;
console.log("PORT FROM RAILWAY:", process.env.PORT);


server.listen(PORT, "0.0.0.0",  () => {
    console.log(`Server running on port ${PORT}`);
    console.log("Socket.io is Initialized and listening");
});

module.exports = { io };