import { Router,Request,Response } from "express";
import prisma from "@shashankpandey/prisma";
export const WorkFlowRouter=Router()
export interface extendedReq extends Request{
    userId?:number
}
//   title String?
//   enabled Boolean @default(true)
//   nodes Json
//   connections Json
//   userId Int
WorkFlowRouter.post('/',async(req:extendedReq,res:Response)=>{
//creating workflow
const userId=req.userId
//need nodes and connections
})