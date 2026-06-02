const express=require('express')
const { loginController,registerController, getMeController, logoutController } = require('../controllers/auth.controller')
const { identifyUser } = require('../middlewares/auth.middleware')
const { registerValidator, loginValidator } = require('../validators/auth.validator')
const multer=require("multer")
const rateLimit = require('express-rate-limit')

const upload=multer({
    storage:multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
})

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: "Too many login/register attempts from this IP, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
})

const authRouter=express.Router()

// POST: /api/auth/register
authRouter.post('/register', authLimiter, upload.single('profileImage'), registerValidator, registerController)

// POST: /api/auth/login
authRouter.post("/login", authLimiter, loginValidator, loginController)

// GET: /api/auth/get-me
authRouter.get("/get-me",identifyUser,getMeController)

// POST: /api/auth/logout
authRouter.post("/logout",logoutController)

module.exports=authRouter