import express, { Request, Response } from "express"
import Room from '../models/Room'
import MessageModel from "../models/message";
import { timeStamp } from "console";
const router = express.Router();

router.post('/create-room', async (req: Request, res: Response): Promise<void> => {
    
    const {code} = req.body

    if(!code){
        res.json({error:'Room code is required'})
        return;
    }

    try{
        const exists = await Room.findOne({code});
        if(exists){
            res.json({error:"Already exists"})
            return;
        }

        const room = new Room({code })
        await room.save()

        res.json({message:"Room created"})
    }catch(err){
        res.json({error:'Server error'})
    }
})
router.get('/chat-history/:roomCode',async(req,res) => {
    const {roomCode} = req.params;
    try{
        const history = await MessageModel.find({roomCode}).sort({timeStamp:1});
        res.json(history)
    }catch(err){
        res.status(500).json({message:"failed to fetch chat history"})
    }
})
router.post('/check-room', async (req: Request, res: Response): Promise<void> => {
    const {code} = req.body;

    if(!code){
        res.json({error:"Room Code is required"})
        return;
    }

    try{
        const exists = await Room.findOne({code});

        if(exists){
            res.json({exists:true})
        }else{
            res.json({exists:false})
        }
    }catch(error){
        console.log(error)
        res.json({error:'Server Error'})
    }
})

export default router;