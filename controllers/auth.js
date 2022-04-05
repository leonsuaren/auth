const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

exports.register = async (req, res, next) => {
  const {username, email, password} = req.body;

  try {

    const user = await User.create({
      username, email, password
    });

    sendToken(user, 201, res); //lo mismo que abajo solo que se creo la funsion sendToken
    // res.status(201).json({
    //   success: true,
    //   token: "erwqrsdf3r"
    // });

  } catch (error) {
    next(error); //error coming from the middleware
    // res.status(500).json({
    //   success: false,
    //   error: error.message
    // });
  }

}

exports.login = async (req, res, next) => {
  const { email, password }  = req.body;

  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password"), 400)
    // res.status(400).json({success: false, error: "Please provide email and password"}) normal error handler
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if(!user) {
      return next(new ErrorResponse("Invalid credentials"), 401)
      // res.status(404).json({success: false, error: "Invalid credentials"});
    }

    const isMatch = await user.matchPasswords(password);

    if(!isMatch) {
      return next(new ErrorResponse("Invalid credentials"), 401)
      // res.status(404).json({success: false, error: "Invalid credentials"})
    }

    sendToken(user, 200, res);
    // res.status(200).json({success: true, token: "sdfwerwe23df"})

  } catch (error) {
    res.status(500).json({success: false, error: error.message});
  }

}

exports.forgotpassword = (req, res, next) => {
  res.send("Forgot Password route");
}

exports.resetpassword = (req, res, next) => {
  res.send("Reset Password Password route");
}

const sendToken = (user,statusCode, res) => {
  const token = user.getSignedToken();
  res.status(statusCode).json({success: true, token});
}