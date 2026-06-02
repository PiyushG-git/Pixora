const postModel=require("../models/post.model")
const ImageKit=require("@imagekit/nodejs")
const {toFile}=require("@imagekit/nodejs")
const jwt=require("jsonwebtoken")
const likeModel = require("../models/like.model")
const userModel = require("../models/user.model")
const followModel = require("../models/follow.model")
const catchAsync = require("../utils/catchAsync")

const imagekit=new ImageKit({
    privateKey:process.env.IMAGEKIT_PRIVATE_KEY
})


const createPostController = catchAsync(async (req, res) => {
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


})

const getPostController = catchAsync(async (req, res) => {
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
})

const getPostDetails = catchAsync(async (req, res) => {
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
})

const likePostController = catchAsync(async (req, res) => {
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
})


const unLikePostController = catchAsync(async (req, res) => {
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
})

const deletePostController = catchAsync(async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;

    const post = await postModel.findById(postId);
    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== userId) {
        return res.status(403).json({ message: "Unauthorized to delete this post" });
    }

    await postModel.findByIdAndDelete(postId);
    await likeModel.deleteMany({ post: postId });

    res.status(200).json({ message: "Post deleted successfully" });
})


const getFeedController = catchAsync(async (req, res) => {
    const userId = req.user?.id
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    let query = {}
    if (userId) {
        const follows = await followModel.find({ follower: userId }).lean()
        const followedIds = follows.map(f => f.followee)
        followedIds.push(userId) // include own posts
        query = { user: { $in: followedIds } }
    }

    // 1. Fetch posts with pagination
    const posts = await postModel.find(query).sort({_id:-1}).skip(skip).limit(limit).populate("user").lean()
    
    // 2. Extract all post IDs
    const postIds = posts.map(p => p._id);

    // 3. Fetch like counts
    const likeCounts = await likeModel.aggregate([
        { $match: { post: { $in: postIds } } },
        { $group: { _id: '$post', count: { $sum: 1 } } }
    ]);
    const likeCountMap = new Map(likeCounts.map(l => [l._id.toString(), l.count]));

    // 4. If logged in, fetch user's likes and follows
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

    // 5. Create Sets for fast lookups
    const likedPostIds = new Set(userLikes.map(like => like.post.toString()));
    const followedUserIds = new Set(userFollows.map(follow => follow.followee.toString()));

    // 6. Map over the posts in memory and attach isLiked, isFollowing, and likeCount
    const postsWithDetails = posts.map(post => {
        post.isLiked = likedPostIds.has(post._id.toString());
        post.likeCount = likeCountMap.get(post._id.toString()) || 0;
        if (post.user) {
            post.user.isFollowing = followedUserIds.has(post.user._id.toString());
        }
        return post;
    });

    res.status(200).json({
        message: "posts fetched successfully",
        posts: postsWithDetails
    })
})



const searchPostController = catchAsync(async (req, res) => {
    const q = (req.query.q || '').trim()
    const userId = req.user?.id
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    if (!q) {
        return res.status(200).json({ posts: [] })
    }

    const matchingUsers = await userModel.find({
        username: { $regex: q, $options: 'i' }
    }).select('_id').lean()

    const matchingUserIds = matchingUsers.map(u => u._id)

    const posts = await postModel.find({
        $or: [
            { caption: { $regex: q, $options: 'i' } },
            { user: { $in: matchingUserIds } }
        ]
    }).sort({ _id: -1 }).skip(skip).limit(limit).populate('user').lean()

    const postIds = posts.map(p => p._id)

    const likeCounts = await likeModel.aggregate([
        { $match: { post: { $in: postIds } } },
        { $group: { _id: '$post', count: { $sum: 1 } } }
    ]);
    const likeCountMap = new Map(likeCounts.map(l => [l._id.toString(), l.count]));

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
            isLiked: likedPostIds.has(post._id.toString()),
            likeCount: likeCountMap.get(post._id.toString()) || 0
        };
    });

    res.status(200).json({ posts: postsWithDetails })
})

const getPopularPostsController = catchAsync(async (req, res) => {
    const userId = req.user?.id
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

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
        { $skip: skip },
        { $limit: limit },
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
})


module.exports={
    createPostController,
    getPostController,
    getPostDetails,
    likePostController,
    getFeedController,
    unLikePostController,
    searchPostController,
    getPopularPostsController,
    deletePostController
}