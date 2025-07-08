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
const db_1 = __importDefault(require("./config/db"));
const Users_1 = __importDefault(require("./routes/Users"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
(0, db_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api', room_1.default);
app.use('/api', Users_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST']
    }
});
io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
    socket.on('create-room', (roomCode) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield Room_1.default.create({ code: roomCode });
        }
        catch (err) {
            console.log("Already exist");
        }
    }));
    socket.on('join', (roomCode) => __awaiter(void 0, void 0, void 0, function* () {
        const room = yield Room_1.default.findOne({ code: roomCode });
        if (!room) {
            socket.emit('error', 'Room does not exist');
            return;
        }
        socket.join(roomCode);
        const sockets = yield io.in(roomCode).fetchSockets();
        io.to(roomCode).emit('user-count', sockets.length);
    }));
    socket.on('message', ({ code, msg }) => {
        socket.to(code).emit('message', `Stranger: ${msg}`);
    });
    socket.on('disconnecting', () => __awaiter(void 0, void 0, void 0, function* () {
        for (const roomCode of socket.rooms) {
            if (roomCode == socket.id)
                continue;
            const sockets = yield io.in(roomCode).fetchSockets();
            const newcount = sockets.length - 1;
            io.to(roomCode).emit('user-count', newcount);
        }
        console.log("Disconnected");
    }));
    socket.on('disconnected', () => {
        console.log("Disconnected");
    });
}));
const PORT = 3001;
server.listen(PORT, () => {
    console.log('Socket.io running');
});
