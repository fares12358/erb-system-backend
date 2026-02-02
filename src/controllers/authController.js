import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendToken } from "../utils/sendToken.js";

/* ================= REGISTER ================= */

export const register = async (req, res) => {
  try {
    const { email } = req.body;

    const alreadyUser = await User.findOne({ email });
    if (alreadyUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expireAt = Date.now() + 5 * 60 * 1000;

    await Otp.findOneAndUpdate(
      { email },
      { otp, expireAt },
      { upsert: true, new: true }
    );

    await sendEmail(
      email,
      "Verify your email",
      `<h2>Your OTP is: ${otp}</h2>`
    );

    res.json({
      success: true,
      message: "OTP sent to email"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ================= VERIFY OTP ================= */

export const verifyOtp = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const otpRecord = await Otp.findOne({ email });

    if (
      !otpRecord ||
      otpRecord.otp !== otp ||
      otpRecord.expireAt < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      isVerified: true
    });

    await Otp.deleteOne({ email });

    res.json({
      success: true,
      message: "Account created successfully",
      data: {
        id: user._id,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ================= LOGIN ================= */

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    sendToken(user, res);

    res.json({
      success: true,
      message: "Logged in successfully",
      data: {
        id: user._id,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ================= FORGET PASSWORD ================= */

export const forgetPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.json({
        success: true,
        message: "If email exists, reset link sent"
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const link = `${process.env.CLIENT_URL}/reset-password/${token}`;

    await sendEmail(
      user.email,
      "Reset Password",
      `<a href="${link}">Reset Password</a>`
    );

    res.json({
      success: true,
      message: "Reset link sent to email"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ================= RESET PASSWORD ================= */

export const resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetExpire: { $gt: Date.now() }
    });
    console.log(req.params.token);
    

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetToken = null;
    user.resetExpire = null;

    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully"  
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ================= GET CURRENT USER ================= */

export const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "User fetched successfully",
      data: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/* ================= LOGOUT ================= */

export const logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production"
    });

    res.json({
      success: true,
      message: "Logged out successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
