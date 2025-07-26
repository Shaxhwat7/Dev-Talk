import { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY || "fallback_key";

export default function jwtverify(req:Request,res:Response,next:NextFunction){
    const authHeaders = req.headers["set-cookie"]
}   