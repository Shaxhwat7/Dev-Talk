"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MessageSchema = new mongoose_1.default.Schema({
    roomCode: {
        type: String,
        required: true
    },
    sender: {
        type: String,
    },
    text: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});
const MessageModel = mongoose_1.default.model('Messages', MessageSchema);
exports.default = MessageModel;
