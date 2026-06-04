const dotenv = require("dotenv");

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorMiddleware = require("./middleware/errorMiddleware");

const { Server } = require("socket.io");

const app = express();

// ---------------- MIDDLEWARE ----------------
app.use(express.json());

const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
];

// ---------------- CORS ----------------
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (!allowedOrigins.includes(origin)) {
            return callback(new Error("CORS blocked"), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

console.log("Server file loaded successfully");

// ---------------- TEST ROUTE ----------------
app.get("/", (req, res) => {
    res.send("Backend is running");
});

// ---------------- ROUTES ----------------
const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/api/admin",
    authMiddleware,
    roleMiddleware("admin"),
    (req, res) => {
        res.json({ message: "Welcome to Admin Panel" });
    }
);

app.use(errorMiddleware);

// ---------------- SERVER START ----------------
const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;

        const server = app.listen(PORT, "0.0.0.0", () => {
            console.log("PORT FROM RAILWAY:", PORT);
            console.log(`Server running on port ${PORT}`);
        });

        // ---------------- SOCKET.IO ----------------
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
                console.log("Joined project:", projectId);
            });

            socket.on("disconnect", () => {
                console.log("User disconnected");
            });
        });

    } catch (err) {
        console.error("Server failed to start:", err);
    }
};

startServer();

module.exports = { app };