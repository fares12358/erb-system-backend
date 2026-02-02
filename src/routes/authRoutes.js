import express from "express";
import {
  register,
  verifyOtp,
  login,
  forgetPassword,
  resetPassword,
  getMe,
  logout
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/forgot-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);
/* session routes */
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
export default router;
