const postModel=require("../models/post.model")
const ImageKit=require("@imagekit/nodejs")
const {toFile}=require("@imagekit/nodejs")
const jwt=require("jsonwebtoken")
const likeModel = require("../models/like.model")
const userModel = require("../models/user.model")
const followModel = require("../models/follow.model")

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

    // 3. If logged in, fetch user's likes and follows. Otherwise empty array.
    let userLikes = [];
    let userFollows = [];
    if (userId) {
        userLikes = await likeModel.find({
            user: userId,
            post: { $in: postIds }
        }).lean();

        const authorIds = [...new Set(posts.map(p => p.user?._id?.toString()).filter(Boolean))];
        userFollows = await followModel.find({
            follower: userId,
            followee: { $in: authorIds }
        }).lean();
    }

    // 4. Create Sets for fast lookups
    const likedPostIds = new Set(userLikes.map(like => like.post.toString()));
    const followedUserIds = new Set(userFollows.map(follow => follow.followee.toString()));

    // 5. Map over the posts in memory and attach isLiked and isFollowing
    const postsWithDetails = posts.map(post => {
        post.isLiked = likedPostIds.has(post._id.toString());
        if (post.user) {
            post.user.isFollowing = followedUserIds.has(post.user._id.toString());
        }
        return post;
    });

    res.status(200).json({
        message:"posts fetched successfully. ",
        posts: postsWithDetails
    })
}



// GET /api/posts/search?q=<query>  [public]
async function searchPostController(req, res) {
    const q = (req.query.q || '').trim()
    const userId = req.user?.id

    if (!q) {
        return res.status(200).json({ posts: [] })
    }

    // Find users whose username matches the query
    const matchingUsers = await userModel.find({
        username: { $regex: q, $options: 'i' }
    }).select('_id').lean()

    const matchingUserIds = matchingUsers.map(u => u._id)

    // Find posts where caption OR author username matches
    const posts = await postModel.find({
        $or: [
            { caption: { $regex: q, $options: 'i' } },
            { user: { $in: matchingUserIds } }
        ]
    }).sort({ _id: -1 }).populate('user').lean()

    // Attach isLiked and isFollowing
    const postIds = posts.map(p => p._id)
    let userLikes = [];
    let userFollows = [];
    if (userId) {
        userLikes = await likeModel.find({
            user: userId,
            post: { $in: postIds }
        }).lean();

        const authorIds = [...new Set(posts.map(p => p.user?._id?.toString()).filter(Boolean))];
        userFollows = await followModel.find({
            follower: userId,
            followee: { $in: authorIds }
        }).lean();
    }

    const likedPostIds = new Set(userLikes.map(like => like.post.toString()))
    const followedUserIds = new Set(userFollows.map(follow => follow.followee.toString()));

    const postsWithDetails = posts.map(post => {
        if (post.user) {
            post.user.isFollowing = followedUserIds.has(post.user._id.toString());
        }
        return {
            ...post,
            isLiked: likedPostIds.has(post._id.toString())
        };
    });

    res.status(200).json({ posts: postsWithDetails })
}

// GET /api/posts/popular  [public]
// Returns posts sorted by total like count (highest to lowest)
async function getPopularPostsController(req, res) {
    const userId = req.user?.id

    // Aggregate: count likes per post, sort descending, lookup user
    const postsWithCounts = await postModel.aggregate([
        {
            $lookup: {
                from: 'likes',
                localField: '_id',
                foreignField: 'post',
                as: 'likesArr'
            }
        },
        {
            $addFields: {
                likeCount: { $size: '$likesArr' }
            }
        },
        { $sort: { likeCount: -1 } },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userArr'
            }
        },
        {
            $addFields: {
                user: { $arrayElemAt: ['$userArr', 0] }
            }
        },
        {
            $project: {
                likesArr: 0,
                userArr: 0,
                'user.password': 0
            }
        }
    ])

    // Attach isLiked and isFollowing
    const postIds = postsWithCounts.map(p => p._id)
    let userLikes = [];
    let userFollows = [];
    if (userId) {
        userLikes = await likeModel.find({
            user: userId,
            post: { $in: postIds }
        }).lean();

        const authorIds = [...new Set(postsWithCounts.map(p => p.user?._id?.toString()).filter(Boolean))];
        userFollows = await followModel.find({
            follower: userId,
            followee: { $in: authorIds }
        }).lean();
    }

    const likedPostIds = new Set(userLikes.map(like => like.post.toString()))
    const followedUserIds = new Set(userFollows.map(follow => follow.followee.toString()));

    const posts = postsWithCounts.map(post => {
        if (post.user) {
            post.user.isFollowing = followedUserIds.has(post.user._id.toString());
        }
        return {
            ...post,
            isLiked: likedPostIds.has(post._id.toString())
        };
    });

    res.status(200).json({ posts })
}

module.exports={
    createPostController,
    getPostController,
    getPostDetails,
    likePostController,
    getFeedController,
    unLikePostController,
    searchPostController,
    getPopularPostsController
}