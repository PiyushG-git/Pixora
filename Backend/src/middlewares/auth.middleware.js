const jwt=require("jsonwebtoken")

async function identifyUser(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      message: "UnAuthorized Access",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user=decoded
  } catch (error) {
    return res.status(401).json({
      message: "Invalid Token",
    });
  }
  next()
}

async function optionalIdentifyUser(req, res, next) {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user=decoded
    } catch (error) {
      // Ignore invalid tokens for optional routes
    }
  }
  next()
}

module.exports={ identifyUser, optionalIdentifyUser }