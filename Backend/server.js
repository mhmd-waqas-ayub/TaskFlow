const dotenv = require("dotenv");

// Load env only in development
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const http = require("http");
const { Server } = require("socket.io");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();
const server = http.createServer(app);

// ---------------- CORS ----------------
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
];

// ---------------- Middleware ----------------
app.use(express.json());

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error("CORS not allowed"), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

console.log("Server file loaded successfully");

// ---------------- Routes ----------------
const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");

app.get("/", (req, res) => {
    res.send("Backend is running");
});

app.get("/api/admin",
    authMiddleware,
    roleMiddleware("admin"),
    (req, res) => {
        res.json({ message: "Welcome to Admin Panel" });
    }
);

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use(errorMiddleware);

// ---------------- SERVER START ----------------
const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;

        server.listen(PORT, "0.0.0.0", () => {
            console.log("PORT FROM RAILWAY:", process.env.PORT);
            console.log(`Server running on port ${PORT}`);
            console.log("Socket.io is Initialized and listening");
        });

        // ---------------- SOCKET.IO (AFTER SERVER START) ----------------
        const io = new Server(server, {
            cors: {
                origin: allowedOrigins,
                methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
                credentials: true
            }
        });

        app.set("io", io);

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

    } catch (err) {
        console.error("Failed to start server:", err);
    }
};

startServer();

module.exports = { app };