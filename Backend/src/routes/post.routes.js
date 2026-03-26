const express=require('express')
const { createPostController, getPostController, getPostDetails, likePostController, getFeedController, unLikePostController } = require('../controllers/post.controller')
const multer=require("multer")
const upload=multer({storage:multer.memoryStorage()})
const { identifyUser, optionalIdentifyUser } = require("../middlewares/auth.middleware")


const postRouter=express.Router()

// api1
// post -/api/posts[protected]
// req.body={caption,image-file}

postRouter.post("/",upload.single("image"),identifyUser,createPostController)


// GET /api/posts/ [protected]

postRouter.get("/",identifyUser,getPostController)


// GET /api/posts/details/:postid
// -return an details about specific post with the id. also check whether the post belongs to the user that the request come form
postRouter.get("/details/:postId",identifyUser,getPostDetails)


// POST /api/posts/like/:postid
// like a post with the id provided in the request params.
postRouter.post("/like/:postId",identifyUser,likePostController)

postRouter.post("/unlike/:postId",identifyUser,unLikePostController)


// GET /api/posts/feed
// get all the post created in the DB
// private
postRouter.get("/feed",optionalIdentifyUser,getFeedController)


module.exports=postRouter 