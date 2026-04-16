import express from "express";
import {
  validateRegistration,
  validateLogin,
} from "../validators/auth.validator.js";
import * as authControllers from "../controllers/auth.controller.js";
import { authUser, authAdmin } from "../middlewares/auth.middleware.js";
import passport from "passport";

const router = express.Router();

// POST :  api/auth/register
router.post("/register", validateRegistration, authControllers.register);

// POST : api/auth/report-invalid-registration-attempt
router.post(
  "/report-invalid-registration-attempt",
  authControllers.reportInvalidRegistrationAttempt
);

// POST :  api/auth/verify-otp
router.post("/verify-otp", authControllers.verifyOtp);

// POST :  api/auth/resend-otp
router.post("/resend-otp", authControllers.resendOtp);

// POST :  api/auth/set-password  (for new Google users)
router.post("/set-password", authControllers.setPassword);

// POST :  api/auth/login
router.post("/login", validateLogin, authControllers.login);

// POST :  api/auth/logout
router.post("/logout", authControllers.logout);

// GET :  api/auth/me
router.get("/me", authUser, authControllers.getMe);

// POST :  api/auth/logout-all
router.post("/logoutAll", authUser, authControllers.logoutAll);

// POST :  api/auth/refresh-token
router.post("/refreshToken", authControllers.refreshToken);

// POST :  api/auth/admin/register
router.post("/admin/register", authAdmin, authControllers.registerAdmin);

// DELETE :  api/auth/deleteProfile
router.delete("/deleteProfile", authUser, authControllers.deleteProfile);

// GET :  api/auth/google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// GET :  api/auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  authControllers.googleCallback
);

// POST :  api/auth/forgot-password
router.post("/forgot-password", authControllers.forgotPassword);

// POST :  api/auth/reset-password
router.post("/reset-password", authControllers.resetPassword);

export default router;
