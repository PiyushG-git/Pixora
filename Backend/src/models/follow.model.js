const mongoose=require("mongoose")

const followSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: [true, "Follower id is required"]
  },
  followee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: [true, "Followee id is required"]
  }
}, { timestamps: true });

// Prevent a user from following the same person twice
followSchema.index({ follower: 1, followee: 1 }, { unique: true })

const followModel=mongoose.model("follows", followSchema)

module.exports=followModel