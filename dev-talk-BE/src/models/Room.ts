import mongoose, { Model, Types } from "mongoose";

const RoomSchema = new mongoose.Schema({
    code:{
        type:String,
        unique:true,
        required:true
    }
})

const Room = mongoose.model('Room',RoomSchema)

export default Room