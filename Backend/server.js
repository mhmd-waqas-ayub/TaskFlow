const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors=require("cors");
const connectDB = require("./config/db");

const http=require("http");
const {Server}=require("socket.io");
const errorMiddleware=require("./middleware/errorMiddleware");


// ✅ Connect DB FIRST
connectDB();

const app = express();
// Socket And Server
const server=http.createServer(app);
const io=new Server(server,{
    cors:{
        origin:"http://localhost:5173",
        methods:["GET","POST","PATCH","DELETE"]   
    }
});
app.set("io",io);



// ✅ Middleware
app.use(express.json());

//cors:
app.use(cors({
    origin:"http://localhost:5173",
    methods:["GET","POST","PUT","PATCH","DELETE"],
    credentials:true
}));



const authMiddleware=require("./middleware/authMiddleware");
const roleMiddleware=require("./middleware/roleMiddleware");



app.get("/api/admin",
    authMiddleware,
    roleMiddleware("admin")
,(req,res)=>{
    res.json({
        message:"Welcome to Admin Panel",
        
        // user:req.user
    })
})


// ✅ Routes
const authRoutes = require("./routes/authRoutes");
const projectRoutes=require("./routes/projectRoutes");
const taskRoutes=require("./routes/taskRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/projects",projectRoutes);
app.use("/api/tasks",taskRoutes);
app.use(errorMiddleware);




// Connected

io.on("connection",(socket)=>{
    console.log("User connected:",socket.id)

    // Join Project Room                         Rooms: without room every user recieve every update
    socket.on("joinProject",(projectId)=>{
        socket.join(projectId);
        console.log(
            `Socket joined projects:${projectId}`
        )
    });
    
    // Disconnect
    socket.on("disconnect",()=>{
        console.log("User Disconnected")
    
    });

});



// ✅ Start server
const PORT = process.env.PORT || 5000;

// app.listen(PORT,'127.0.0.1',()=>{
//     console.log(`Server running on: http://127.0.0.1:  ${PORT}`);
// });
server.listen(PORT, '127.0.0.1', ()=>{
    console.log(`Server is running on:http://localhost:${PORT}`);
    console.log("Socket.io is Initialized and listening")
});

module.exports={ io };