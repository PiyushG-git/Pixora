const followModel = require("../models/follow.model");
const userModel = require("../models/user.model");
const postModel = require("../models/post.model");
const ImageKit=require("@imagekit/nodejs")
const {toFile}=require("@imagekit/nodejs")
const catchAsync = require("../utils/catchAsync")
const likeModel = require("../models/like.model")

const imagekit=new ImageKit({
    privateKey:process.env.IMAGEKIT_PRIVATE_KEY
})

const followUserController = catchAsync(async (req, res) => {
  const followerId = req.user.id;
  const followerUsername = req.user.username;
  const followeeUsername = req.params.username;

  if (followeeUsername === followerUsername) {
    return res.status(400).json({
      message: "You cannot follow yourself",
    });
  }

  const isFolloweeExists = await userModel.findOne({
    username: followeeUsername,
  });

  if (!isFolloweeExists) {
    return res.status(404).json({
      message: "User you are trying to follow does not exist",
    });
  }

  const followeeId = isFolloweeExists._id;

  const isAlreadyFollowing = await followModel.findOne({
    follower: followerId,
    followee: followeeId,
  });

  if (isAlreadyFollowing) {
    return res.status(200).json({
      message: `You are already following ${followeeUsername}`,
      follow: isAlreadyFollowing,
    });
  }

  const followRecord = await followModel.create({
    follower: followerId,
    followee: followeeId,
  });

  res.status(201).json({
    message: `You are now following ${followeeUsername}`,
    follow: followRecord,
  });
})

const unfollowUserController = catchAsync(async (req, res) => {
  const followerId = req.user.id;
  const followerUsername = req.user.username;
  const followeeUsername = req.params.username;

  const isFolloweeExists = await userModel.findOne({
    username: followeeUsername,
  });

  if (!isFolloweeExists) {
    return res.status(404).json({
      message: "User you are trying to unfollow does not exist",
    });
  }

  const followeeId = isFolloweeExists._id;

  const isuserFollowing = await followModel.findOne({
    follower: followerId,
    followee: followeeId,
  });

  if (!isuserFollowing) {
    return res.status(200).json({
      message: `You are not following ${followeeUsername}`,
    });
  }

  await followModel.findByIdAndDelete(isuserFollowing._id);

  res.status(200).json({
    message: `You have unfollowed ${followeeUsername}`,
  });
})

// GET /api/users/top  [public]
// Returns users sorted by follower count (highest to lowest)
const getTopCreatorsController = catchAsync(async (req, res) => {
  const currentUserId = req.user?.id

  // Aggregate follows to count followers per user
  const topCreators = await followModel.aggregate([
    {
      $group: {
        _id: '$followee',
        followerCount: { $sum: 1 }
      }
    },
    { $sort: { followerCount: -1 } },
    { $limit: 8 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    { $unwind: '$userDetails' },
    {
      $project: {
        _id: 1,
        followerCount: 1,
        username: '$userDetails.username',
        profileImage: '$userDetails.profileImage'
      }
    }
  ])

  // Check which users the current user is already following
  let followingSet = new Set()
  if (currentUserId) {
    const topIds = topCreators.map(u => u._id)
    const existingFollows = await followModel.find({
      follower: currentUserId,
      followee: { $in: topIds }
    }).lean()
    followingSet = new Set(existingFollows.map(f => f.followee.toString()))
  }

  const users = topCreators.map(u => ({
    ...u,
    isFollowing: followingSet.has(u._id.toString())
  }))

  res.status(200).json({ users })
})

const getUserProfileController = catchAsync(async (req, res) => {
  const { username } = req.params;
  const currentUserId = req.user?.id;
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  const user = await userModel.findOne({ username }).lean();
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const followerCount = await followModel.countDocuments({ followee: user._id });
  const followingCount = await followModel.countDocuments({ follower: user._id });

  let isFollowing = false;
  if (currentUserId) {
    const follow = await followModel.findOne({ follower: currentUserId, followee: user._id });
    isFollowing = !!follow;
  }

  const posts = await postModel.find({ user: user._id }).sort({ _id: -1 }).skip(skip).limit(limit).populate('user').lean();

  const postIds = posts.map(p => p._id);
  const likeCounts = await likeModel.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: '$post', count: { $sum: 1 } } }
  ]);
  const likeCountMap = new Map(likeCounts.map(l => [l._id.toString(), l.count]));

  let userLikes = [];
  if (currentUserId) {
      userLikes = await likeModel.find({
          user: currentUserId,
          post: { $in: postIds }
      }).lean();
  }
  const likedPostIds = new Set(userLikes.map(like => like.post.toString()));
  
  const postsWithLikes = posts.map(post => ({
      ...post,
      isLiked: likedPostIds.has(post._id.toString()),
      likeCount: likeCountMap.get(post._id.toString()) || 0,
      user: { ...post.user, isFollowing }
  }));

  res.status(200).json({
    user: {
      _id: user._id,
      username: user.username,
      bio: user.bio,
      profileImage: user.profileImage,
      followerCount,
      followingCount,
      isFollowing
    },
    posts: postsWithLikes
  });
})

const updateProfileController = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { bio, username } = req.body;

  const updateData = {};
  if (bio !== undefined) updateData.bio = bio;
  if (username) updateData.username = username;

  if (req.file) {
      try {
          const fileUpload = await imagekit.files.upload({
              file: await toFile(Buffer.from(req.file.buffer), 'file'),
              fileName: "profileImage",
              folder: "pixora-profiles"
          });
          updateData.profileImage = fileUpload.url;
      } catch (error) {
          console.error("Image upload failed", error);
      }
  }

  if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No data provided to update" });
  }

  try {
      const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, { new: true }).lean();
      res.status(200).json({
          message: "Profile updated successfully",
          user: updatedUser
      });
  } catch (error) {
      // Handle unique username conflict
      if (error.code === 11000) {
          return res.status(409).json({ message: "Username already taken" });
      }
      throw error;
  }
})

module.exports = { followUserController, unfollowUserController, getTopCreatorsController, getUserProfileController, updateProfileController };


