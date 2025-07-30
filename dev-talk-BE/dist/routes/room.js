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
const Room_1 = __importDefault(require("../models/Room"));
const message_1 = __importDefault(require("../models/message"));
const router = express_1.default.Router();
router.post('/create-room', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.body;
    if (!code) {
        res.json({ error: 'Room code is required' });
        return;
    }
    try {
        const exists = yield Room_1.default.findOne({ code });
        if (exists) {
            res.json({ error: "Already exists" });
            return;
        }
        const room = new Room_1.default({ code });
        yield room.save();
        res.json({ message: "Room created" });
    }
    catch (err) {
        res.json({ error: 'Server error' });
    }
}));
router.get('/chat-history/:roomCode', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomCode } = req.params;
    console.log("Incoming roomCode:", roomCode);
    try {
        const history = yield message_1.default.find({ roomCode }).sort({ timestamp: 1 });
        console.log("Fetched history:", history);
        res.json(history);
    }
    catch (err) {
        console.error("DB error:", err);
        res.status(500).json({ message: "Failed to fetch chat history" });
    }
}));
router.post('/check-room', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.body;
    if (!code) {
        res.json({ error: "Room Code is required" });
        return;
    }
    try {
        const exists = yield Room_1.default.findOne({ code });
        if (exists) {
            res.json({ exists: true });
        }
        else {
            res.json({ exists: false });
        }
    }
    catch (error) {
        console.log(error);
        res.json({ error: 'Server Error' });
    }
}));
exports.default = router;
