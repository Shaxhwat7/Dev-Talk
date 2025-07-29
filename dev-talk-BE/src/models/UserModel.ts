import mongoose, { model, Model } from "mongoose";

const UserModel = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true

    },
    password:{
        type:String,
        required:true
    }
})

const UsersModel = mongoose.model('Users',UserModel)

export default UsersModel