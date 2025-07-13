"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const Room_1 = __importDefault(require("./models/Room"));
const room_1 = __importDefault(require("./routes/room"));
const Users_1 = __importDefault(require("./routes/Users"));
const db_1 = __importDefault(require("./config/db"));
const message_1 = __importDefault(require("./models/message"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
(0, db_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api", room_1.default);
app.use("/api", Users_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
const socketRooms = new Map();
io.on("connection", (socket) => {
    console.log("🔌 New socket connected:", socket.id);
    socket.on("create-room", (roomCode) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield Room_1.default.create({ code: roomCode });
            console.log(`📝 Room created: ${roomCode}`);
        }
        catch (_a) {
            console.log(`📝 Room already exists: ${roomCode}`);
        }
    }));
    socket.on("join", (roomCode) => __awaiter(void 0, void 0, void 0, function* () {
        const room = yield Room_1.default.findOne({ code: roomCode });
        if (!room) {
            socket.emit("error", "Room does not exist");
            return;
        }
        socket.join(roomCode);
        socketRooms.set(socket.id, roomCode);
        const sockets = yield io.in(roomCode).fetchSockets();
        const userCount = sockets.length;
        console.log(`Room [${roomCode}] - Active users: ${userCount}`);
        io.to(roomCode).emit("user-count", userCount);
    }));
    socket.on("message", (_a) => __awaiter(void 0, [_a], void 0, function* ({ code, msg }) {
        const currentRoom = socketRooms.get(socket.id);
        if (currentRoom === code) {
            socket.to(code).emit("message", `Stranger: ${msg}`);
            yield message_1.default.create({
                roomCode: code,
                sender: socket.id,
                text: msg
            });
        }
        else {
            console.log(`⚠️ Socket ${socket.id} tried to send message to room ${code} but is not in that room`);
        }
    }));
    socket.on("disconnecting", () => __awaiter(void 0, void 0, void 0, function* () {
        for (const roomCode of socket.rooms) {
            if (roomCode === socket.id)
                continue;
            const sockets = yield io.in(roomCode).fetchSockets();
            const remaining = sockets.length - 1;
            if (remaining === 0) {
                try {
                    yield Room_1.default.findOneAndDelete({ code: roomCode });
                    yield message_1.default.deleteMany({ roomCode });
                }
                catch (err) {
                    console.log('Error deleting room or messages');
                }
            }
            else {
                io.to(roomCode).emit('user-count', remaining);
            }
        }
    }));
    socket.on("disconnect", (reason) => {
        console.log(`❌ Socket disconnected: ${socket.id}, reason: ${reason}`);
        const room = socketRooms.get(socket.id);
        if (room) {
            socketRooms.delete(socket.id);
            console.log(`🧹 Cleaned up socket ${socket.id} from room mapping`);
        }
    });
});
const sendUserCount = (roomCode) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sockets = yield io.in(roomCode).fetchSockets();
        const userCount = sockets.length;
        console.log(`👥 Room [${roomCode}] - Active users: ${userCount}`);
        console.log(`🔍 Socket IDs in room: ${sockets.map(s => s.id).join(', ')}`);
        const mappedSockets = Array.from(socketRooms.entries())
            .filter(([_, room]) => room === roomCode)
            .map(([socketId, _]) => socketId);
        console.log(`🗂️ Mapped sockets for room: ${mappedSockets.join(', ')}`);
        io.to(roomCode).emit("user-count", userCount);
    }
    catch (error) {
        console.error(`❌ Error sending user count for room ${roomCode}:`, error);
    }
});
const cleanupStaleConnections = () => {
    const connectedSockets = new Set(io.sockets.sockets.keys());
    for (const [socketId, room] of socketRooms.entries()) {
        if (!connectedSockets.has(socketId)) {
            console.log(`🧹 Removing stale socket mapping: ${socketId} -> ${room}`);
            socketRooms.delete(socketId);
        }
    }
};
setInterval(cleanupStaleConnections, 5 * 60 * 1000);
const PORT = 3001;
server.listen(PORT, () => {
    console.log("✅ Socket.io running on port", PORT);
});
