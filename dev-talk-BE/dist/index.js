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
const roomUsers = new Map();
io.on("connection", (socket) => {
    console.log("New socket connected:", socket.id);
    socket.on("create-room", (roomCode) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield Room_1.default.create({ code: roomCode });
            console.log(`Room created: ${roomCode}`);
        }
        catch (_a) {
            console.log(`Room already exists: ${roomCode}`);
        }
    }));
    socket.on("join", (roomCode, username) => __awaiter(void 0, void 0, void 0, function* () {
        const room = yield Room_1.default.findOne({ code: roomCode });
        if (!room) {
            socket.emit("error", "Room does not exist");
            return;
        }
        if (!roomUsers.has(roomCode)) {
            roomUsers.set(roomCode, new Set());
        }
        const users = roomUsers.get(roomCode);
        users.add(username);
        socket.data.username = username;
        socket.data.roomCode = roomCode;
        socket.join(roomCode);
        console.log(`${username} joined room ${roomCode}`);
        io.to(roomCode).emit("user-count", Array.from(users));
    }));
    socket.on("message", (_a) => __awaiter(void 0, [_a], void 0, function* ({ code, msg }) {
        const roomCode = socket.data.roomCode;
        const username = socket.data.username;
        if (roomCode !== code) {
            console.warn(`${username} tried to send message to wrong room.`);
            return;
        }
        socket.to(code).emit("message", `${username}: ${msg}`);
        yield message_1.default.create({
            roomCode: code,
            sender: username,
            text: msg,
        });
    }));
    socket.on("disconnecting", () => __awaiter(void 0, void 0, void 0, function* () {
        const roomCode = socket.data.roomCode;
        const username = socket.data.username;
        if (roomCode && username) {
            const users = roomUsers.get(roomCode);
            users === null || users === void 0 ? void 0 : users.delete(username);
            if (users && users.size === 0) {
                try {
                    yield Room_1.default.findOneAndDelete({ code: roomCode });
                    yield message_1.default.deleteMany({ roomCode });
                    roomUsers.delete(roomCode);
                    console.log(`Deleted room ${roomCode} due to no users`);
                }
                catch (err) {
                    console.error("Error deleting room or messages:", err);
                }
            }
            else {
                io.to(roomCode).emit("user-count", Array.from(users !== null && users !== void 0 ? users : []));
            }
        }
    }));
    socket.on("disconnect", (reason) => {
        console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`);
    });
});
const PORT = 3001;
server.listen(PORT, () => {
    console.log("Socket.io server running on port", PORT);
});
