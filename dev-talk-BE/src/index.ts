import express from "express";
import { createServer } from "http";
import { Server,Socket } from "socket.io";
import cors from 'cors';
import  Room  from "./models/Room";
import roomRoutes from "./routes/room"
import mongoose from "mongoose";
import connectDB from "./config/db";   
import UserRoutes from "./routes/Users"
const app = express();
const server = createServer(app);
connectDB();
app.use(cors());
app.use(express.json())
app.use('/api',roomRoutes)
app.use('/api',UserRoutes)
const io = new Server(server,{
    cors:{
        origin:"*",
        methods:['GET','POST']
    }
});

io.on('connection',async (socket:Socket)=>{
    socket.on('create-room',async(roomCode:string) =>{
        try{
            await Room.create({code:roomCode});
        }catch(err){
            console.log("Already exist")
        }
    })
    socket.on('join',async (roomCode:string)=>{
        const room = await Room.findOne({code:roomCode})
        if(!room){
            socket.emit('error','Room does not exist');
            return;
        }
        socket.join(roomCode)
        const sockets = await io.in(roomCode).fetchSockets();
        io.to(roomCode).emit('user-count',sockets.length);
    })
    socket.on('message',({code,msg} : {code:string;msg:string}) =>{
        socket.to(code).emit('message', `Stranger: ${msg}`)
    })

    socket.on('disconnecting',async ()=>{
        for(const roomCode of socket.rooms){
            if(roomCode == socket.id) continue;

            const sockets = await io.in(roomCode).fetchSockets();
            const newcount = sockets.length - 1;
            io.to(roomCode).emit('user-count',newcount)
        }
        console.log("Disconnected")
    })

    socket.on('disconnected',()=>{
        console.log("Disconnected")
    })
})

const PORT = 3001;
server.listen(PORT,()=>{
    console.log('Socket.io running')
})