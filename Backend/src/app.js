const express = require("express")
const cookieParser=require("cookie-parser")
const cors=require("cors")
const path = require("path")
const helmet = require("helmet")

const authRouter = require("./routes/auth.routes")
const postRouter = require("./routes/post.routes")
const userRouter = require("./routes/user.routes")
const errorHandler = require("./middlewares/error.middleware")


const app=express()

app.use(express.json())
app.use(helmet())
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}))


app.use("/api/auth",authRouter)
app.use("/api/posts",postRouter)
app.use("/api/users",userRouter)

// Serve the static React frontend
app.use(express.static(path.join(__dirname, '..', 'dist')))

// Catch-all route for Express v5 to serve React's index.html for client-side routing
app.use('*name', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'dist', 'index.html'))
})

// Global error handler — catches any error thrown/passed via next(err) in controllers
app.use(errorHandler)

module.exports=app;