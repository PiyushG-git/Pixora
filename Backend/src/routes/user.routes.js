const express =require("express")
const { followUserController, unfollowUserController, getTopCreatorsController, getUserProfileController, updateProfileController } = require('../controllers/user.controller');
const { identifyUser, optionalIdentifyUser } = require("../middlewares/auth.middleware");
const multer = require("multer")
const upload = multer({ storage: multer.memoryStorage() });

const userRouter=express.Router();

// POST /api/users/follow/:userid
// Follow a user
// accesss Private
userRouter.post("/follow/:username",identifyUser,followUserController)

userRouter.post("/unfollow/:username",identifyUser,unfollowUserController)

// GET /api/users/profile/:username
userRouter.get('/profile/:username', optionalIdentifyUser, getUserProfileController)

// PUT /api/users/profile
userRouter.put('/profile', identifyUser, upload.single('profileImage'), updateProfileController)

// GET /api/users/top  [public] — top users by follower count
userRouter.get("/top",optionalIdentifyUser,getTopCreatorsController)


module.exports=userRouter