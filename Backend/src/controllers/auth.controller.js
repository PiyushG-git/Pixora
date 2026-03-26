const userModel = require("../models/user.model");
// const crypto=require('crypto')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function registerController(req, res) {
  const { email, username, password, bio, profileImage } = req.body;

  // is this we calling data base individully

  // const isUserExistByEmail=await userModel.findOne({email})
  // if(isUserExistByEmail){
  //     return res.status(409).json({
  //         message:"User already exists with same email"
  //     })
  // }

  // const isUserExistByuserName=await userModel.findOne({username})
  // if(isUserExistByuserName){
  //     return res.status(409).json({
  //         message:"User already exists by username"
  //     })
  // }

  // in a single call
  const isUserAlreadyExists = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserAlreadyExists) {
    return res.status(409).json({
      message:
        "User already exists" +
        (isUserAlreadyExists.email == email
          ? "Email already exists"
          : "Username already exists"),
    });
  }

  // const hash = crypto.createHash('sha256').update(password).digest('hex')
  const hash = await bcrypt.hash(password, 10);
  const user = await userModel.create({
    username,
    email,
    bio,
    profileImage,
    password: hash,
  });
  // jwt.sign(kis basics kr token bnana hai,jwtsecret,expiresIn(optional))
  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  res.cookie("token", token);

  res.status(201).json({
    message: "User Registered Successfully",
    user: {
      email: user.email,
      username: user.username,
      bio: user.bio,
      profileImage: user.profileImage,
    },
  });
}

async function loginController(req, res) {
  const { email, username, password } = req.body;

  // username&password {username:x,email:undefined,passsword:test}
  // ya
  // email &password {username:undefined,email:xyz@gmail.com,passsword:test}

  const user = await userModel.findOne({

  //   $or: [{ username: username }, { email: email }],
  // });    //yehh kaam issliye nhi krega kyuki usermodel me password ko select false kr diya hai tohh hmme forcely select("+password") krke hi check krna hoga

    $or: [{ username: username }, { email: email }],
  }).select("+password");
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  // const hash = crypto.createHash('sha256').update(password).digest('hex')
  // const isPasswordValid =hash==user.password

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "password invaild",
    });
  }
  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
  res.cookie("token", token);

  res.status(200).json({
    message: "User loggedIn successfully.",
    user: {
      email: user.email,
      username: user.username,
      bio: user.bio,
      profileImage: user.profileImage,
    },
  });
}


async function getMeController(req,res) {
  const userId=req.user.id
  const user=await userModel.findById(userId)
  res.status(200).json({
    user:{
      username:user.username,
      email:user.email,
      bio:user.bio,
      profileImage:user.profileImage
    }
  })
}

async function logoutController(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax"
  })
  res.status(200).json({ message: "Logged out successfully" })
}

module.exports = {
  registerController,
  loginController,
  getMeController,
  logoutController
};
