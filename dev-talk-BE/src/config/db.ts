import mongoose, { mongo } from "mongoose";

const connectDB = async () =>{
    const uri = "mongodb+srv://admin:admin123@cluster0.2e2op.mongodb.net/";

    if(!uri){
        console.log('Incorrect url')
        return;
    }
    try{
        await mongoose.connect(uri)
    }catch(err){
        process.exit(1);
    }
}

export default connectDB