import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import Room from "./models/Room";
import roomRoutes from "./routes/room";
import userRoutes from "./routes/Users";
import connectDB from "./config/db";
import MessageModel from "./models/message";
import { timeStamp } from "console";

const app = express();
const server = createServer(app);
connectDB();

app.use(cors());
app.use(express.json());
app.use("/api", roomRoutes);
app.use("/api", userRoutes);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const socketRooms = new Map<string, string>();

io.on("connection", (socket: Socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("create-room", async (roomCode: string) => {
    try {
      await Room.create({ code: roomCode });
      console.log(`Room created: ${roomCode}`);
    } catch {
      console.log(`Room already exists: ${roomCode}`);
    }
  });

socket.on("join", async (roomCode: string) => {
  const room = await Room.findOne({ code: roomCode });
  if (!room) {
    socket.emit("error", "Room does not exist");
    return;
  }


  socket.join(roomCode);
  socketRooms.set(socket.id, roomCode);

  const sockets = await io.in(roomCode).fetchSockets();
  const userCount = sockets.length;

  console.log(`Room [${roomCode}] - Active users: ${userCount}`);
  io.to(roomCode).emit("user-count", userCount);
});


  socket.on("message", async ({ code, msg }: { code: string; msg: string }) => {
    const currentRoom = socketRooms.get(socket.id);
    if (currentRoom === code) {
      socket.to(code).emit("message", `Stranger: ${msg}`);
      await MessageModel.create({
        roomCode:code,
        sender:socket.id,
        text:msg
      })
    } else {
      console.log(`Socket ${socket.id} tried to send message to room ${code} but is not in that room`);
    }
  });

  socket.on("disconnecting", async () => {
    
    for(const roomCode of socket.rooms){
      if(roomCode === socket.id) continue;

      const sockets = await io.in(roomCode).fetchSockets();

      const remaining = sockets.length - 1
      if(remaining === 0){
        try{
          await Room.findOneAndDelete({code:roomCode})
          await MessageModel.deleteMany({roomCode})
        }catch(err){
          console.log('Error deleting room or messages')
        }
      }else{
        io.to(roomCode).emit('user-count',remaining)
      }
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`);
    
    const room = socketRooms.get(socket.id);
    if (room) {
      socketRooms.delete(socket.id);
      console.log(`Cleaned up socket ${socket.id} from room mapping`);
    }
  });
});

const sendUserCount = async (roomCode: string) => {
  try {
    const sockets = await io.in(roomCode).fetchSockets();
    const userCount = sockets.length;
    
    console.log(`Room [${roomCode}] - Active users: ${userCount}`);
    console.log(`Socket IDs in room: ${sockets.map(s => s.id).join(', ')}`);
    
    const mappedSockets = Array.from(socketRooms.entries())
      .filter(([_, room]) => room === roomCode)
      .map(([socketId, _]) => socketId);
    console.log(`🗂️ Mapped sockets for room: ${mappedSockets.join(', ')}`);
    
    io.to(roomCode).emit("user-count", userCount);
  } catch (error) {
    console.error(`Error sending user count for room ${roomCode}:`, error);
  }
};

const cleanupStaleConnections = () => {
  const connectedSockets = new Set(io.sockets.sockets.keys());
  
  for (const [socketId, room] of socketRooms.entries()) {
    if (!connectedSockets.has(socketId)) {
      console.log(`Removing stale socket mapping: ${socketId} -> ${room}`);
      socketRooms.delete(socketId);
    }
  }
};

setInterval(cleanupStaleConnections, 5 * 60 * 1000);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(" Socket.io running on port", PORT);
});