const postModel=require("../models/post.model")
const ImageKit=require("@imagekit/nodejs")
const {toFile}=require("@imagekit/nodejs")
const jwt=require("jsonwebtoken")
const likeModel = require("../models/like.model")

const imagekit=new ImageKit({
    privateKey:process.env.IMAGEKIT_PRIVATE_KEY
})


async function createPostController(req,res){
    // // console.log(req.body,req.file);

    // // to find that which user is requesting
    // const token=req.cookies.token

    // if(!token){
    //     return res.status(401).json({
    //         message:"Token not provided,Unathorized access"
    //     })
    // }
    // // get user id from jwt token
    // let decoded=null
    // try {
    //     decoded=jwt.verify(token,process.env.JWT_SECRET)
    // } catch (error) {
    //     return res.status(401).json({
    //         message:"User not authorized"
    //     })
    // }



    // imagekit
    const file=await imagekit.files.upload({
        file:await toFile(Buffer.from(req.file.buffer),'file'),
        fileName:"Test",
        folder:"cohort-2-insta-clone-posts"
    })
    // res.send(file)


    //storage in db
    const post=await postModel.create({
        caption:req.body.caption,
        imgurl:file.url,
        // user:decoded.id

        //using middleware
        user:req.user.id
    })

    res.status(201).json({
        message:"Post created successfully",
        post
    })


}

async function getPostController(req,res){
    // const token=req.cookies.token
    // let decoded=null;
    // try {
    //     decoded=jwt.verify(token,process.env.JWT_SECRET)
    // } catch (error) {
    //     return res.status(401).json({
    //         message:"Token Invalid"
    //     })
    // }
    // const userId=decoded.id

    //middleware
    const userId=req.user.id
    const posts=await postModel.find({
        user:userId
    })

    res.status(200).json({
        message:"Posts fetched succesfully",
        posts
    })
}

async function getPostDetails(req,res) {
    // const token=req.cookies.token
    // if(!token){
    //     return res.status(401).json({
    //         message:"UnAuthorized Access"
    //     })
    // }

    // let decoded;
    // try {
    //     decoded=jwt.verify(token,process.env.JWT_SECRET)
    // } catch (error) {
    //     return res.status(401).json({
    //         message:"Invalid Token"
    //     })
    // }
    // const userId=decoded.id;

    //middleware
    const userId=req.user.id
    const postId=req.params.postId

    const post=await postModel.findById(postId)

    if(!post){
        return res.status(404).json({
            message:"Post not found"
        })
    }

    return res.status(200).json({
        message:"Post fetched successfully",
        post
    })
}

async function likePostController(req,res) {
    const userId=req.user.id
    const postId=req.params.postId

    const post=await postModel.findById(postId)

    if(!post){
        return res.status(404).json({
            message:"Post not found."
        })
    }

    const like =await likeModel.create({
        post:postId,
        user:userId
    })

    res.status(200).json({
        message:"Post liked successfully",
        like
    })
}


async function unLikePostController(req,res){
    const userId=req.user.id
    const postId=req.params.postId

    const isLiked=await likeModel.findOne({
        post:postId,
        user:userId
    })

    if(!isLiked){
        return res.status(400).json({
            message:"Post didn't like"
        })
    }

    await likeModel.findOneAndDelete({_id:isLiked._id})

    return res.status(200).json({
        message:"post un liked successfully"
    })
}


async function getFeedController(req,res) {
    const userId = req.user?.id

    // 1. Fetch all posts
    const posts = await postModel.find({}).sort({_id:-1}).populate("user").lean()
    
    // 2. Extract all post IDs
    const postIds = posts.map(p => p._id);

    // 3. If logged in, fetch user's likes. Otherwise empty array.
    const userLikes = userId ? await likeModel.find({
        user: userId,
        post: { $in: postIds }
    }).lean() : [];

    // 4. Create a Set of liked post IDs for ultra-fast O(1) lookups
    const likedPostIds = new Set(userLikes.map(like => like.post.toString()));

    // 5. Map over the posts in memory and attach the isLiked boolean
    const postsWithLikes = posts.map(post => {
        post.isLiked = likedPostIds.has(post._id.toString());
        return post;
    });

    res.status(200).json({
        message:"posts fetched successfully. ",
        posts: postsWithLikes
    })
}



module.exports={
    createPostController,
    getPostController,
    getPostDetails,
    likePostController,
    getFeedController,
    unLikePostController
}