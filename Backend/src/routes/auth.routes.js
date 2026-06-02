const express=require('express')
const { loginController,registerController, getMeController, logoutController } = require('../controllers/auth.controller')
const { identifyUser } = require('../middlewares/auth.middleware')
const multer=require("multer")
const upload=multer({storage:multer.memoryStorage()})

const authRouter=express.Router()

// POST: /api/auth/register
authRouter.post('/register',upload.single('profileImage'),registerController)

// POST: /api/auth/login
authRouter.post("/login",loginController)

// GET: /api/auth/get-me
authRouter.get("/get-me",identifyUser,getMeController)

// POST: /api/auth/logout
authRouter.post("/logout",logoutController)

module.exports=authRouter