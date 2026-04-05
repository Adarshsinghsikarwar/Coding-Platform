import express from "express";
import {
  validateRegistration,
  validateLogin,
} from "../validators/auth.validator.js";
import {
  register,
  login,
  logout,
  getMe,
  logoutAll,
  refreshToken,
  registerAdmin
} from "../controllers/auth.controller.js";
import { authUser , authAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// POST :  api/auth/register
router.post("/register", validateRegistration, register);

// POST :  api/auth/login
router.post("/login", validateLogin, login);

// POST :  api/auth/logout
router.post("/logout", logout);

// GET :  api/auth/me
router.get("/me", authUser, getMe);

// POST :  api/auth/logout-all
router.post("/logoutAll", authUser, logoutAll);

// POST :  api/auth/refresh-token
router.post("/refreshToken", refreshToken);

// POST :  api/auth/admin/register
router.post("/admin/register", authAdmin, registerAdmin);


export default router;
