import userModel from "../models/user.model.js";
import otpModel from "../models/otp.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import sessionModel from "../models/session.model.js";
import { sendEmail } from "../services/email.service.js";
import {
  sendRegistrationSuccessAlert,
  sendWrongEmailRegistrationAlert,
} from "../services/registrationAlert.service.js";
import OtpUtil, { getWelcomeHtml } from "../utils/Otp.js";

// ──────────────────────────────────────────────
// Helper: Find session by refresh token
// ──────────────────────────────────────────────
async function findSessionByRefreshToken(refreshToken) {
  try {
    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

    const activeSessions = await sessionModel.find({
      user: decoded.id,
      revoked: false,
    });

    for (const session of activeSessions) {
      const isMatch = await bcrypt.compare(
        refreshToken,
        session.refreshTokenHash
      );
      if (isMatch) {
        return { session, decoded };
      }
    }

    return { session: null, decoded };
  } catch {
    return { session: null, decoded: null };
  }
}

// ──────────────────────────────────────────────
// Helper: Create session and return tokens
// ──────────────────────────────────────────────
async function createSessionAndTokens(user, req) {
  const refreshToken = jwt.sign(
    { id: user._id, role: user.role },
    config.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  const session = new sessionModel({
    user: user._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });
  await session.save();

  const accessToken = jwt.sign(
    { id: user._id, role: user.role, sessionId: session._id },
    config.JWT_SECRET,
    { expiresIn: "15m" }
  );

  return { refreshToken, accessToken };
}

// ──────────────────────────────────────────────
// POST /api/auth/report-invalid-registration-attempt
// Used by frontend when client-side validation blocks invalid email submit.
// ──────────────────────────────────────────────
export async function reportInvalidRegistrationAttempt(req, res) {
  try {
    const attemptedEmail = String(req.body?.emailId || "").trim();
    const reason = String(req.body?.reason || "Invalid email format").trim();

    if (!attemptedEmail) {
      return res.status(400).json({ message: "emailId is required" });
    }

    const alertResult = await sendWrongEmailRegistrationAlert({
      attemptedEmail,
      reason,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      source: "frontend-validation",
    });

    return res.status(200).json({
      message: "Attempt recorded",
      alertSent: Boolean(alertResult?.ok),
    });
  } catch (err) {
    console.error("Error while reporting invalid registration attempt:", err);
    return res.status(200).json({
      message: "Attempt recorded",
      alertSent: false,
    });
  }
}

// ──────────────────────────────────────────────
// POST /api/auth/register
// ──────────────────────────────────────────────
export async function register(req, res) {
  try {
    const { firstName, emailId, password, age, lastName } = req.body;
    const normalizedEmail = String(emailId || "")
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ emailId: normalizedEmail });
    if (existingUser) {
      if (!existingUser.verified) {
        return res.status(409).json({
          message:
            "Email is already registered but not verified. Please verify using OTP.",
          email: existingUser.emailId,
          requiresOtp: true,
        });
      }

      return res.status(400).json({
        message: "User already exists",
        email: existingUser.emailId,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (not verified yet)
    const newUser = new userModel({
      firstName,
      emailId: normalizedEmail,
      password: hashedPassword,
      age,
      role: "user",
      lastName,
      authProvider: "local",
      verified: false,
    });
    await newUser.save();

    // Generate OTP and send email
    const otp = OtpUtil.generateOtp();
    await otpModel.create({ email: normalizedEmail, otp: String(otp) });

    const otpHtml = OtpUtil.getOtpHtml(otp);
    await sendEmail(
      normalizedEmail,
      "Verify your email - OTP",
      `Your OTP is: ${otp}`,
      otpHtml
    );

    res.status(201).json({
      message:
        "Registration successful. Please verify your email with the OTP sent.",
      email: normalizedEmail,
    });
  } catch (err) {
    console.error("Error occurred while registering user:", err);

    if (err?.code === 11000 && err?.keyPattern?.emailId) {
      return res.status(400).json({
        message: "User already exists",
        email: String(req.body?.emailId || "")
          .trim()
          .toLowerCase(),
      });
    }

    res.status(500).json({
      message: "Server error",
      error: err.message,
      email: req.body?.emailId || null,
    });
  }
}

// ──────────────────────────────────────────────
// POST /api/auth/verify-otp
// ──────────────────────────────────────────────
export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Find the OTP record
    const otpRecord = await otpModel.findOne({ email, otp: String(otp) });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Mark user as verified
    const user = await userModel.findOne({ emailId: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.verified = true;
    await user.save();

    // Delete the used OTP
    await otpModel.deleteMany({ email });

    // Send welcome email now that user is fully verified
    const welcomeHtml = getWelcomeHtml(user.firstName);
    await sendEmail(
      email,
      "Welcome to the Platform! 🚀",
      `Welcome ${user.firstName}! Your email has been verified. Happy coding!`,
      welcomeHtml
    );

    // Notify admin in plain status format (without OTP details).
    await sendRegistrationSuccessAlert({
      firstName: user.firstName,
      emailId: user.emailId,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // Create session and tokens
    const { refreshToken, accessToken } = await createSessionAndTokens(
      user,
      req
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Email verified successfully",
      user,
      accessToken,
    });
  } catch (err) {
    console.error("Error occurred while verifying OTP:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// ──────────────────────────────────────────────
// POST /api/auth/resend-otp
// ──────────────────────────────────────────────
export async function resendOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await userModel.findOne({ emailId: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    // Delete old OTPs for this email
    await otpModel.deleteMany({ email });

    // Generate new OTP and send email
    const otp = OtpUtil.generateOtp();
    await otpModel.create({ email, otp: String(otp) });

    const otpHtml = OtpUtil.getOtpHtml(otp);
    await sendEmail(
      email,
      "Verify your email - OTP",
      `Your OTP is: ${otp}`,
      otpHtml
    );

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (err) {
    console.error("Error occurred while resending OTP:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// ──────────────────────────────────────────────
// POST /api/auth/login
// ──────────────────────────────────────────────
export async function login(req, res) {
  try {
    const { emailId, password } = req.body;

    const user = await userModel.findOne({ emailId });
    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }

    // Check if user registered via Google
    if (user.authProvider === "google") {
      return res.status(400).json({
        message: "This account uses Google login. Please sign in with Google.",
      });
    }

    // Check if user is verified
    if (!user.verified) {
      return res.status(403).json({
        message: "Please verify your email first",
        email: user.emailId,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Create session and tokens
    const { refreshToken, accessToken } = await createSessionAndTokens(
      user,
      req
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ message: "Login successful", user, accessToken });
  } catch (err) {
    console.error("Error occurred while logging in user:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// ──────────────────────────────────────────────
// POST /api/auth/logout
// ──────────────────────────────────────────────
export async function logout(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token not found" });
    }

    const { session } = await findSessionByRefreshToken(refreshToken);

    if (!session) {
      return res.status(400).json({ message: "Invalid refresh token" });
    }
    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Error occurred while logging out user:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// ──────────────────────────────────────────────
// GET /api/auth/me
// ──────────────────────────────────────────────
export async function getMe(req, res) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token not found" });
    }
    const decoded = jwt.verify(token, config.JWT_SECRET);

    const user = await userModel.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User retrieved successfully", user });
  } catch (err) {
    console.error("Error occurred while retrieving user:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// ──────────────────────────────────────────────
// POST /api/auth/logoutAll
// ──────────────────────────────────────────────
export async function logoutAll(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token not found" });
    }

    const { decoded } = await findSessionByRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(400).json({ message: "Invalid refresh token" });
    }

    await sessionModel.updateMany(
      { user: decoded.id, revoked: false },
      { revoked: true }
    );

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "All sessions logged out successfully" });
  } catch (err) {
    console.error("Error occurred while logging out all sessions:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// ──────────────────────────────────────────────
// POST /api/auth/refresh-token
// ──────────────────────────────────────────────
export async function refreshToken(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token not found" });
    }

    const { session } = await findSessionByRefreshToken(refreshToken);

    if (!session) {
      return res.status(400).json({ message: "Invalid refresh token" });
    }

    const user = await userModel.findById(session.user).select("role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const accessToken = jwt.sign(
      { id: session.user, role: user.role, sessionId: session._id },
      config.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    const newRefreshToken = jwt.sign(
      { id: session.user, role: user.role },
      config.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res
      .status(200)
      .json({ message: "Access token refreshed successfully", accessToken });
  } catch (err) {
    console.error("Error occurred while refreshing access token:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// ──────────────────────────────────────────────
// POST /api/auth/admin/register
// ──────────────────────────────────────────────
export async function registerAdmin(req, res) {
  try {
    const { firstName, emailId, password, age, lastName } = req.body;
    // Check if the user already exists
    const existingUser = await userModel.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new userModel({
      firstName,
      emailId,
      password: hashedPassword,
      age,
      lastName,
      role: "admin",
    });

    await newUser.save();

    res.status(201).json({ message: "Admin user created successfully" });
  } catch (err) {
    console.error("Error occurred while creating admin user:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// ──────────────────────────────────────────────
// DELETE /api/auth/deleteProfile
// ──────────────────────────────────────────────
export async function deleteProfile(req, res) {
  try {
    const userId = req.user.id;

    await userModel.findByIdAndDelete(userId);

    // await submissionModel.deleteMany({ userId: userId });

    res.status(200).json({ message: "User profile deleted successfully" });
  } catch (err) {
    console.error("Error occurred while deleting user profile:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// ──────────────────────────────────────────────
// GET /api/auth/google/callback
// ──────────────────────────────────────────────
export async function googleCallback(req, res) {
  const redirectOrigin = req.cookies.oauth_redirect_origin || config.FRONTEND_URL;
  res.clearCookie("oauth_redirect_origin");

  try {
    const user = req.user; // Set by passport after Google auth

    // If the user has no password, they are new — ask them to set one
    if (!user.password) {
      // Issue a short-lived temp token (10 min) just for the set-password step
      const tempToken = jwt.sign(
        { id: user._id, purpose: "set-password" },
        config.JWT_SECRET,
        { expiresIn: "10m" }
      );

      // Redirect to the set-password page with the temp token in URL
      return res.redirect(
        `${redirectOrigin}/set-password?token=${tempToken}`
      );
    }

    // Returning user — already has a password — log them in directly

    // Create session and tokens
    const { refreshToken, accessToken } = await createSessionAndTokens(
      user,
      req
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend with access token in URL
    res.redirect(`${redirectOrigin}?accessToken=${accessToken}`);
  } catch (err) {
    console.error("Error occurred during Google callback:", err);
    res.redirect(`${redirectOrigin}/login?error=google_auth_failed`);
  }
}

// ──────────────────────────────────────────────
// POST /api/auth/set-password
// Called after Google signup to set a password for the new account
// ──────────────────────────────────────────────
export async function setPassword(req, res) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and password are required" });
    }

    // Verify the temp token issued during Google callback
    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET);
    } catch {
      return res.status(401).json({
        message: "Invalid or expired token. Please sign in with Google again.",
      });
    }

    // Make sure this token was issued only for set-password
    if (decoded.purpose !== "set-password") {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash and save the new password
    user.password = await bcrypt.hash(password, 10);
    await user.save();

    // Send welcome email now that the account is fully set up
    const welcomeHtml = getWelcomeHtml(user.firstName);
    await sendEmail(
      user.emailId,
      "Welcome to the Platform! 🚀",
      `Welcome ${user.firstName}! Your account is ready. Happy coding!`,
      welcomeHtml
    );

    // Create session and return tokens — user is now logged in
    const { refreshToken, accessToken } = await createSessionAndTokens(
      user,
      req
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Password set successfully",
      user,
      accessToken,
    });
  } catch (err) {
    console.error("Error occurred while setting password:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// ──────────────────────────────────────────────
// POST /api/auth/forgot-password
// ──────────────────────────────────────────────
export async function forgotPassword(req, res) {
  try {
    const { emailId } = req.body;

    if (!emailId) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await userModel.findOne({ emailId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.authProvider === "google") {
      return res.status(400).json({
        message:
          "This account uses Google login. You cannot reset password here.",
      });
    }

    // Delete any old OTPs
    await otpModel.deleteMany({ email: emailId });

    // Generate new OTP and send email
    const otp = OtpUtil.generateOtp();
    await otpModel.create({ email: emailId, otp: String(otp) });

    const otpHtml = OtpUtil.getOtpHtml(otp);
    await sendEmail(
      emailId,
      "Password Reset - OTP",
      `Your OTP is: ${otp}`,
      otpHtml
    );

    res.status(200).json({ message: "Password reset OTP sent to your email" });
  } catch (err) {
    console.error("Error occurred while requesting password reset:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// ──────────────────────────────────────────────
// POST /api/auth/reset-password
// ──────────────────────────────────────────────
export async function resetPassword(req, res) {
  try {
    const { emailId, otp, newPassword } = req.body;

    if (!emailId || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, OTP, and new password are required" });
    }

    const user = await userModel.findOne({ emailId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otpRecord = await otpModel.findOne({
      email: emailId,
      otp: String(otp),
    });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Clean up OTP
    await otpModel.deleteMany({ email: emailId });

    res
      .status(200)
      .json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("Error occurred while resetting password:", err);
    res.status(500).json({ message: "Server error" });
  }
}
