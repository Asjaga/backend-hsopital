import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*"
  }
});
console.log("Socket.io initialized");
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });   
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});