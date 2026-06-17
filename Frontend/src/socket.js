import { io } from "socket.io-client";

const socket = io("https://taskflow-production-1eff.up.railway.app", {
    transports: ["websocket"]
});
export default socket;