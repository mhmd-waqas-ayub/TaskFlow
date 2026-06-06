const dotenv = require("dotenv");
if (process.env.NODE_ENV !== "production") dotenv.config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);

// ==========================
// DATABASE
// ==========================
connectDB()
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
        console.error("DB error:", err);
        process.exit(1);
    });

// ==========================
// CORS
// ==========================
const allowedOrigins = [
    "http://localhost:5173",
    "https://taskflow-production-1eff.up.railway.app"
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));

// ==========================
// MIDDLEWARE
// ==========================
app.use(express.json());

// ==========================
// HEALTH CHECK
// ==========================
app.get("/", (req, res) => {
    res.status(200).send("Backend is alive");
});

// ==========================
// SOCKET.IO
// ==========================
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

app.set("io", io);

// ==========================
// ROUTES
// ==========================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

// ==========================
// START SERVER
// ==========================
const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});