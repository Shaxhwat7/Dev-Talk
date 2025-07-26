import express from "express";
import {Router,Request,Response} from "express";
import UsersModel from "../models/UserModel";
import jwt from "jsonwebtoken";
import * as dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || "fallback_secret"; 

const router = Router();

router.post('/create-user', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        const exist = await UsersModel.findOne({ username: username });

        if (exist) {
            res.status(409).json({ message: "User already exists" });
            return;
        }

        const createuser = new UsersModel({
            username: username,
            password: password,
        });

        await createuser.save();

        const token = jwt.sign(
            { id: createuser._id, username: username },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Sign up successful",
            token
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: "Server Error"
        });
    }
});


export default router;
