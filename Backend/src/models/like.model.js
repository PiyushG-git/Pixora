const mongoose=require("mongoose")

const likeSchema=new mongoose.Schema({
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"posts",
        required:[true,"posts id is required for creating a like"]
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:[true,"user id is required for creating a like"]
    }
},{timestamps:true})

// so that one person can like one post only one time
likeSchema.index({post:1,user:1},{unique:true})

const likeModel=mongoose.model("likes",likeSchema)

module.exports=likeModel