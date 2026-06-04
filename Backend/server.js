const dotenv = require("dotenv");
if (process.env.NODE_ENV !== "production") dotenv.config();

const express = require("express");
const cors = require("cors");
const app = express();

// ---------------- MUST BE FIRST RESPONSE ----------------
app.get("/", (req, res) => {
    res.status(200).send("Backend is alive");
});

// ---------------- BASIC MIDDLEWARE ----------------
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// ---------------- START SERVER FIRST ----------------
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log("Server started on", PORT);
});

// ---------------- CONNECT DB AFTER SERVER IS LIVE ----------------
const connectDB = require("./config/db");

connectDB()
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log("DB error:", err));

// ---------------- SOCKET.IO AFTER SERVER IS LIVE ----------------
const { Server } = require("socket.io");

const io = new Server(server, {
    cors: {
        origin: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    }
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
});

app.set("io", io);

module.exports = { app };