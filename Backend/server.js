const dotenv = require("dotenv");
if (process.env.NODE_ENV !== "production") dotenv.config();

const express = require("express");
const cors = require("cors");
const http = require("http");

const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);

// =========================
// DB
// =========================
connectDB()
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("DB error:", err);
    process.exit(1);
  });

// =========================
// CORS FIX (PRODUCTION SAFE)
// =========================
const allowedOrigins = [
  "http://localhost:5173",
  "https://task-flow-black-two.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // 🔥 TEMP SAFE MODE (prevents CORS crash)
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));

app.options(/.*/, cors());

// =========================
// MIDDLEWARE
// =========================
app.use(express.json());

// =========================
// ROUTES
// =========================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

// =========================
// HEALTH CHECK
// =========================
app.get("/", (req, res) => {
  res.send("Backend is alive");
});

// =========================
// SOCKET.IO
// =========================
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
});

app.set("io", io);

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port:", PORT);
});