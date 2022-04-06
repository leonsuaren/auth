const crypto = require('crypto');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');

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
    const user = await User.findOne({ email }).select("+password"); //method select include or exclude a field from findOne, in this case "+password" include the password with the - would exclude the password

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

exports.forgotpassword = async (req, res, next) => {
  // Send Email to email provided but first check if user exists
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse("No email could not be sent", 404));
    }

    // Reset Token Gen and add to database hashed (private) version of token
    const resetToken = user.getResetPasswordToken();

    await user.save();

    // Create reset url to email to provided email
    const resetUrl = `http://localhost:3000/passwordreset/${resetToken}`;

    // HTML Message
    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please make a put request to the following link:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        text: message,
      });

      res.status(200).json({ success: true, data: "Email Sent", resetToken: resetToken });
    } catch (err) {

      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return next(new ErrorResponse("Email could not be sent", 500));
    }
  } catch (err) {
    next(err);
  }
};

exports.resetpassword = async (req, res, next) => {
  // Compare token in URL params to hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse("Invalid Token", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({
      success: true,
      data: "Password Updated Success",
      token: user.getSignedToken(),
    });
  } catch (err) {
    next(err);
  }
};

const sendToken = (user,statusCode, res) => {
  const token = user.getSignedToken();
  res.status(statusCode).json({success: true, token});
}