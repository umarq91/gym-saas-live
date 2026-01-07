

import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../db";


export const createGymOwner = async(req:Request,res:Response)=>{
  try {
    const {name,username,email,password,gymId} =  req.body;

    const existingUser = await prisma.user.findUnique({where:{email}})

    if(existingUser){
      return res.status(400).json({
        sucess:false,
        message:"Email already exists"
      })
    }

    if(!gymId){
      return res.status(403).json({
        success:false,
        message:"Gym ID is required!"
      })
    }

    const hashedPass = await bcrypt.hash(password,12)

   await prisma.user.create({
      data:{
        name,email,password:hashedPass,username,gymId
      }
    })
    
  return res.status(201).json({
    success:true,
    message:"A new Gym Owner sccessfully created!"
  })

  } catch (error) {
    console.error("ERROR",error)
    return res.json({
      success:false,
      error
    })
  }
  

}