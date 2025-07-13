import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    roomCode:{
        type:String,
        required:true
    },
    sender:{
        type:String,
    },
    text:{
        type:String,
        required:true
    },
    timestamp:{
        type:Date,
        default:Date.now,
    },
})  

const MessageModel = mongoose.model('Messages',MessageSchema)

export default MessageModel