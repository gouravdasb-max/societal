import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Society } from "../models/society.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { sendPasswordResetOtpEmail, sendVerificationEmail, sendAdminOtpEmail } from "../utils/email.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

const generateTokens = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const createVerificationToken = (user) => {
  const token = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return token;
};
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, flatNumber, phone, role, adminCode, societyName, societyCity, inviteCode } =
    req.body;

  if (![fullName, email, password].every((f) => f && f.trim())) {
    throw new ApiError(400, "Full name, email and password are required");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  let finalRole = "resident";
  let society;
  if (role === "admin") {
    if (!adminCode || adminCode !== process.env.ADMIN_SIGNUP_CODE) {
      throw new ApiError(403, "Invalid admin signup code");
    }
    finalRole = "admin";
    if (!societyName?.trim()) throw new ApiError(400, "Society name is required for an admin account");
    let generatedCode;
    do { generatedCode = crypto.randomBytes(4).toString("hex").toUpperCase(); } while (await Society.exists({ inviteCode: generatedCode }));
    society = await Society.create({ name: societyName, city: societyCity, inviteCode: generatedCode });
  } else {
    if (!inviteCode?.trim()) throw new ApiError(400, "Society invite code is required");
    society = await Society.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
    if (!society) throw new ApiError(404, "No society was found with that invite code");
  }

  let avatarUrl = "";
  const avatarLocalPath = req.file?.path;
  if (avatarLocalPath) {
    const uploaded = await uploadOnCloudinary(avatarLocalPath);
    avatarUrl = uploaded?.url || "";
  }

  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    password,
    flatNumber,
    phone,
    role: finalRole,
    avatar: avatarUrl,
    society: society._id,
    isApproved: finalRole === "admin",
  });
  if (finalRole === "admin") { society.createdBy = user._id; await society.save(); }

  const verificationToken = createVerificationToken(user);
  await user.save({ validateBeforeSave: false });

  try {
    await sendVerificationEmail({
      email: user.email,
      fullName: user.fullName,
      token: verificationToken,
    });
  } catch (error) {
    console.error("Verification email could not be sent:", error.message);
    await user.deleteOne();
    if (finalRole === "admin") await society.deleteOne();
    throw new ApiError(503, "Could not send verification email. Please try again shortly.");
  }

  const createdUser = await User.findById(user._id)
    .populate("society", "name city inviteCode")
    .select("-password -refreshToken");

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdUser,
        "Registration successful. Check your email to verify your account."
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(404, "No account found with this email");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect password");
  }
  if (user.isEmailVerified === false) {
    throw new ApiError(403, "Please verify your email address before logging in");
  }

  if (user.role === "resident" && !user.isApproved) {
    throw new ApiError(
      403,
      "Your account is awaiting admin approval. Please check back later."
    );
  }

  if (user.role === "admin") {
    const otp = crypto.randomInt(100000, 1000000).toString();
    user.loginOtp = crypto.createHash("sha256").update(otp).digest("hex");
    user.loginOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.loginOtpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    await sendAdminOtpEmail({ email: user.email, fullName: user.fullName, otp, purpose: 'Login' });

    return res.status(200).json(
      new ApiResponse(200, { requiresOtp: true, email: user.email }, "Admin OTP sent")
    );
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);
  const loggedInUser = await User.findById(user._id).populate("society", "name city inviteCode").select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken },
        "Logged in successfully"
      )
    );
});

const verifyLoginOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new ApiError(400, "Email and OTP are required");

  const user = await User.findOne({ email: email.toLowerCase(), role: "admin" });
  if (!user || user.loginOtpAttempts >= 5 || !user.loginOtpExpires || user.loginOtpExpires <= new Date()) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
  if (hashedOtp !== user.loginOtp) {
    user.loginOtpAttempts += 1;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(401, "Incorrect OTP");
  }

  user.loginOtp = undefined;
  user.loginOtpExpires = undefined;
  user.loginOtpAttempts = 0;
  await user.save({ validateBeforeSave: false });

  const { accessToken, refreshToken } = await generateTokens(user._id);
  const loggedInUser = await User.findById(user._id).populate("society", "name city inviteCode").select("-password -refreshToken");

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, { user: loggedInUser, accessToken }, "Logged in successfully"));
});


const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken } = await generateTokens(user._id);
    const refreshedUser = await User.findById(user._id)
      .populate("society", "name city inviteCode")
      .select("-password -refreshToken");

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(200, { user: refreshedUser, accessToken }, "Access token refreshed successfully")
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: 1 },
  });

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("society", "name city inviteCode")
    .select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Current user fetched"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token, email } = req.body;
  if (!token || !email) {
    throw new ApiError(400, "Verification token and email are required");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    email: email.toLowerCase(),
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError(400, "This verification link is invalid or has expired");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, {}, "Email verified successfully. You can now log in."));
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || user.isEmailVerified) {
    return res.status(200).json(new ApiResponse(200, {}, "If this account needs verification, a new email has been sent."));
  }

  const token = createVerificationToken(user);
  await user.save({ validateBeforeSave: false });
  await sendVerificationEmail({ email: user.email, fullName: user.fullName, token });

  return res.status(200).json(new ApiResponse(200, {}, "If this account needs verification, a new email has been sent."));
});

const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email: email.toLowerCase() });
  const message = "If an account exists for this email, a reset code has been sent.";
  if (!user) return res.status(200).json(new ApiResponse(200, {}, message));

  const otp = crypto.randomInt(100000, 1000000).toString();
  user.passwordResetOtp = crypto.createHash("sha256").update(otp).digest("hex");
  user.passwordResetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.passwordResetOtpAttempts = 0;
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetOtpEmail({ email: user.email, fullName: user.fullName, otp });
  } catch (error) {
    console.error("Password reset email could not be sent:", error.message);
    throw new ApiError(503, "Could not send the reset code. Please try again shortly.");
  }

  return res.status(200).json(new ApiResponse(200, {}, message));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) {
    throw new ApiError(400, "Email, reset code and new password are required");
  }
  if (!/^\d{6}$/.test(otp)) {
    throw new ApiError(400, "Enter the 6-digit reset code");
  }
  if (password.length < 8) {
    throw new ApiError(400, "Your new password must be at least 8 characters");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.passwordResetOtp || !user.passwordResetOtpExpires || user.passwordResetOtpExpires <= new Date()) {
    throw new ApiError(400, "This reset code is invalid or has expired");
  }
  if (user.passwordResetOtpAttempts >= 5) {
    throw new ApiError(429, "Too many incorrect attempts. Request a new reset code.");
  }

  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
  if (hashedOtp !== user.passwordResetOtp) {
    user.passwordResetOtpAttempts += 1;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(400, "Incorrect reset code");
  }

  user.password = password;
  user.passwordResetOtp = undefined;
  user.passwordResetOtpExpires = undefined;
  user.passwordResetOtpAttempts = 0;
  user.refreshToken = undefined;
  await user.save();

  return res.status(200).json(new ApiResponse(200, {}, "Password reset successfully. You can now log in."));
});
const createGuard = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone } = req.body;

  if (![fullName, email, password].every((f) => f && f.trim())) {
    throw new ApiError(400, "Full name, email, and password are required");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const guard = await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase(),
    password,
    phone: phone?.trim() || "",
    role: "guard",
    society: req.user.society,
    isApproved: true, // Guards are auto-approved
    isEmailVerified: true, // Admins create guards, so assume verified
  });

  const guardUser = await User.findById(guard._id).select("-password -refreshToken");

  return res
    .status(201)
    .json(new ApiResponse(201, guardUser, "Guard account created successfully"));
});

export {
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
};
