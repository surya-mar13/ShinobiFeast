
import { config } from "dotenv"
import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'
import bcrypt from 'bcryptjs'
config()

export const authenticate=async({email,password})=>{
    let userCred=await User.findOne({email})
    if(!userCred){
        throw new Error("User not found")
    }
    let isMatch=await bcrypt.compare(password,userCred.password)
    if(!isMatch){
        throw new Error("Password doesn't match")
    }
    let token=jwt.sign({userId:userCred._id,role:userCred.role},process.env.JWT_SECRET_KEY,{expiresIn:"1h"})
    return ({token,userCred})
}