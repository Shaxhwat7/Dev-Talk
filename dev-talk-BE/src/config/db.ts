import mongoose, { mongo } from "mongoose";
import * as dotenv from 'dotenv';

dotenv.config();
const connectDB = async () =>{
    const url = process.env.MONGODBURL


    if(!url){
        console.log('Incorrect url')
        return;
    }
    try{
        await mongoose.connect(url)
    }catch(err){
        process.exit(1);
    }
}

export default connectDB