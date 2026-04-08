import express from "express";
import {
  validateRegistration,
  validateLogin,
} from "../validators/auth.validator.js";
import * as authControllers from "../controllers/auth.controller.js";
import { authUser , authAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// POST :  api/auth/register
router.post("/register", validateRegistration, authControllers.register);

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

// Delete :  api/auth/admin/delete/:id
router.delete("/deleteProfile", authUser, authControllers.deleteProfile);


export default router;
