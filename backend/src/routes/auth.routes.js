import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
  createGuard,
  verifyLoginOtp,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authLimiter, otpLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

router.route("/register").post(authLimiter, upload.single("avatar"), registerUser);
router.route("/login").post(authLimiter, loginUser);
router.route("/verify-login-otp").post(otpLimiter, verifyLoginOtp);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/verify-email").post(authLimiter, verifyEmail);
router.route("/resend-verification").post(authLimiter, resendVerificationEmail);
router.route("/forgot-password").post(otpLimiter, requestPasswordReset);
router.route("/reset-password").post(otpLimiter, resetPassword);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/create-guard").post(verifyJWT, verifyAdmin, createGuard);

export default router;
