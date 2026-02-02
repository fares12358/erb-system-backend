import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  otp: String,
  otpExpire: Date,

  resetToken: String,
  resetExpire: Date,

  isVerified: { type: Boolean, default: false }
});

export default mongoose.model("User", userSchema);
