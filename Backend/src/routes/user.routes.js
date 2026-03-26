const express =require("express")
const {followUserController,unfollowUserController}=require("../controllers/user.controller");
const { identifyUser } = require("../middlewares/auth.middleware");

const userRouter=express.Router();

// POST /api/users/follow/:userid
// Follow a user
// accesss Private
userRouter.post("/follow/:username",identifyUser,followUserController)

userRouter.post("/unfollow/:username",identifyUser,unfollowUserController)


module.exports=userRouter