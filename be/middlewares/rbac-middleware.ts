import { NextFunction, Request, Response } from "express";
import { UserRole } from "../types/user";


export const authorizeRoles = (...roles:UserRole[])=>{
    return (req:Request,res:Response,next:NextFunction)=>{
        const {role} = req?.user;


        if(!roles.includes(role)){
            return res.status(403).json({
                success:false,
                message:"Access denied"
            })
        }

        next();
    }
}