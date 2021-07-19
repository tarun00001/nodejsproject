const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const sendEmail = require("../utils/email");

require("dotenv");

// registration route
router.post("/register", async (req, res) => {
  const {
    firstName,
    lastName,
    gender,
    country,
    password,
    cpassword,
    phone,
    email,
    role,
  } = req.body;

  try {
    //     const userExist = await User.findOne({email})
    // if(userExist){
    //     return res.status(409).json({error: "Email already exist"});
    // }
    const user = new User({
      firstName,
      lastName,
      gender,
      country,
      password,
      cpassword,
      phone,
      email,
      role,
    });

    const userRegister = await user.save();

    res.status(201).json({ message: "User registered successfully" });
    // console.log(`${user} user registered successfully`)
    // console.log(userRegister);
  } catch (err) {
    console.log(err);
    res.status(400).json({ status: 0, message: err.message });
  }
});

// login route
router.post("/login", async (req, res) => {
  // console.log(req.body);
  // res.status(201).json({message: "User login successfully"});
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please fill the Credentials!" });
    }

    const userLogin = await User.findOne({ email });

    const isPasswordMatch = await bcrypt.compare(password, userLogin.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Credentials do not get matched" });
    }

    const payload = { _id: userLogin._id };
    jwt.sign(
      payload,
      "MYNAMEISTARUNSINGHCHAUDHARYANDILIVESINGHAZIABAD",
      { expiresIn: "10d" },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ token, message: "User login successfully" });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

router.get("/all", auth, async (req, res) => {
  try {
    console.log(req.query["role"]);
    var queryObj;
    if (req.query["role"] === "admin") {
      queryObj = { role: "admin" };
    } else if (req.query["role"] === "user") {
      queryObj = { role: "user" };
    } else queryObj = {};
    console.log(queryObj);
    const user = await User.find(queryObj).select("-password -cpassword");
    // const user = await User.findById(req.user._id)
    res.json(user);
    // console.log(user.length)
  } catch (err) {
    res.send({ message: "Error in fetching user" });
  }
});

router.post("/forgotPassword", async (req, res) => {
  try {
    // 1) get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(404)
        .json({ error: "There is no user with this email address." });
    }
    // 2) generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    //3) send it to its user email
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/user/resetPassword?rt=${resetToken}`;

    const message = `<p>Forgot your password ? Submit a Patch request with your new password 
  and passwordConfirm to: ${resetURL}.\n If you donot forget it, please ignore this email!</p> `;

    await sendEmail({
      from: "User <tarunchaudhary@ddtech.com>",
      to: user.email,
      subject: "Password Reset Mail",
      text: resetURL,
      html: message,
    });

    res.status(200).json({
      resetURL,
      status: "success",
      message: "token sent to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({
      status: -1,
      message: "there was an error in sending the mail. try again later!",
    }); //next()
  }
});

router.patch("/resetPassword/:token", async (req, res) => {
  //1) get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2) if token has not expired, and there is a user, set the new password
  if (!user) {
    return res.status(400).json({
      message: "Token is invalid or expired!",
    });
  }
  user.password = req.body.password;
  user.cpassword = req.body.cpassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
});

router.patch("/updateMyPassword", auth, async (req, res) => {
  // get user from collection
  // console.log(req.user._id)
  const user = await User.findOne({ _id: req.user._id }).select("+password");
  // console.log(user);

  //check if posted current password is correct
  // console.log(req.body)
  const isPasswordMatched = await bcrypt.compare(
    req.body.passwordCurrent,
    user.password
  );
  
  if (!isPasswordMatched)
    return res.status(401).json({
      message: "Your current password is incorrect!",
    });
  else
    return res.status(200).json({
      message: "Password changed",
    });

  //3) If so, update password
  user.password = req.body.password;

  await user.save();
});

router.patch("/updateMyprofile", auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id ,{
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      gender: req.body.gender,
      country: req.body.country,
      phone: req.body.phone
    },{
      new: true,
      runValidators: true
    }); 
    return res.status(200).json({
      user: user,
      mesaage: "user updated"
    });
  } catch (error) {
    console.log(error)
    res.status(400).json({status: 0, message: error.message})
  }
});

router.delete("/deleteMe", auth, async (req, res) => {
  const user = await User.findByIdAndUpdate( req.user._id,{ active: false} );
  res.status(204).json({
    data: null
  })
});

module.exports = router;
