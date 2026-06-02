import { Schema,model } from "mongoose";
const userSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{ 
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['user','admin','vendor','deliveryPartner'],
        default:'user'
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    avatar:{
        type:String,
        default:""
    },
    address:{
        type:String,
        default:""
    },
    location:{
        type:String,
        default:""
    }
},
{    timestamps:true,
    strict:true
}
)
const User=model('User',userSchema);
export default User;