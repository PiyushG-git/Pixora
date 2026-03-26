const express = require("express")
const cookieParser=require("cookie-parser")
const cors=require("cors")

const authRouter = require("./routes/auth.routes")
const postRouter = require("./routes/post.routes")
const userRouter = require("./routes/user.routes")


const app=express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}))


app.use("/api/auth",authRouter)
app.use("/api/posts",postRouter)
app.use("/api/users",userRouter)

// Global error handler — catches any error thrown/passed via next(err) in controllers
app.use((err, req, res, next) => {
    console.error("[Server Error]", err.message || err)
    const status = err.status || 500
    res.status(status).json({
        message: err.message || "Internal Server Error"
    })
})

module.exports=app;