import { Schema,model } from "mongoose";
const productSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{

        type:Number,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    imageUrl:{
        type:String
    },
        isVeg:{
            type:Boolean,
            default:false
        },
    restaurant:{
        type:Schema.Types.ObjectId,
        ref:'Restaurant',
        required:true
    }
},{timestamps:true})
const Product=model('Product',productSchema)
export default Product