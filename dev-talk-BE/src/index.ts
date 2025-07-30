import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import Room from "./models/Room";
import roomRoutes from "./routes/room";
import userRoutes from "./routes/Users";
import connectDB from "./config/db";
import MessageModel from "./models/message";

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

const roomUsers = new Map<string, Set<string>>();

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

  socket.on("join", async ({code,user}) => {
    const room = await Room.findOne({ code: code });
    if (!room) {
      socket.emit("error", "Room does not exist");
      return;
    }

    if (!roomUsers.has(code)) {
      roomUsers.set(code, new Set());
    }

    const users = roomUsers.get(code)!;
    users.add(user);

    socket.data.username = user;
    socket.data.roomCode = code;

    socket.join(code);
    console.log(`${user} joined room ${code}`);
    io.to(code).emit("user-count", Array.from(users));
  });

  socket.on("message", async ({ code, msg }: { code: string; msg: string }) => {
    const roomCode = socket.data.roomCode;
    const username = socket.data.username;

    if (roomCode !== code) {
      console.warn(`${username} tried to send message to wrong room.`);
      return;
    }

    socket.to(code).emit("message", `${username}: ${msg}`);
    await MessageModel.create({
      roomCode: code,
      sender: username,
      text: msg,
    });
  });

  socket.on("disconnecting", async () => {
    const roomCode = socket.data.roomCode;
    const username = socket.data.username;

    if (roomCode && username) {
      const users = roomUsers.get(roomCode);
      users?.delete(username);

      if (users && users.size === 0) {
        try {
          await Room.findOneAndDelete({ code: roomCode });
          await MessageModel.deleteMany({ roomCode });
          roomUsers.delete(roomCode);
          console.log(`Deleted room ${roomCode} due to no users`);
        } catch (err) {
          console.error("Error deleting room or messages:", err);
        }
      } else {
        io.to(roomCode).emit("user-count", Array.from(users ?? []));
      }
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log("Socket.io server running on port", PORT);
});
