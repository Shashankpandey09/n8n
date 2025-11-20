import prisma from "@shashankpandey/prisma";
import { Router,Response,Request } from "express";
import bcrypt from 'bcrypt'
import z from "zod";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
dotenv.config()
export const UserRouter=Router()
const SIGNup_SignInSchema=z.object({
 username:z.email(),
 password:z.string().min(4,"Min 4 characters require")
})
const SECRET_KEY=process.env.SECRET_KEY!

UserRouter.post("/signup",async(req:Request,res:Response)=>{
  try {
    const {username,password}=req.body
    const {success,error}=SIGNup_SignInSchema.safeParse({username,password})
    if(!success){
        return res.status(403).json({error:error.issues,message:'error while safeParsing'})
    }
    const user=await prisma.user.findUnique({
        where:{
        email:username
        }
    })
    if(user){
        return res.status(400).json({message:'User already exists in the db'})
    }
    //hashing the password
    const hashedPassword= await bcrypt.hash(password,10);
    //creating the user
    const User=await prisma.user.create({
        data:{
            email:username,
            password:hashedPassword
        }
    })
    const token=jwt.sign({username,id:User.id},SECRET_KEY) 
    return res.status(200).json({message:'User created successfully',user:User,token})
  } catch (error) {
    res.status(500).json({message:'Internal server error while signing up user',error:error})
  }
})
UserRouter.post("/signin", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const { success, error } = SIGNup_SignInSchema.safeParse({ username, password });

    if (!success) {
      return res.status(403).json({ error: error.issues, message: "Invalid credentials format" });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: username
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ username: user.email,id:user.id }, SECRET_KEY);

    return res.status(200).json({
      message: "Signin successful",
      token,
      user
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error while signing in", error });
  }
});