import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import sessionModel from "../models/session.model.js";

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

export async function register(req, res) {
  try {
    const { firstName, emailId, password, age, lastName } = req.body;
    // Check if the user already exists
    req.role = "user";
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
      role: req.role,
      lastName,
    });
    await newUser.save();

    const refreshToken = jwt.sign({ id: newUser._id }, config.JWT_SECRET, {
      expiresIn: "7d",
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    const session = new sessionModel({
      user: newUser._id,
      refreshTokenHash,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    await session.save();

    const accessToken = jwt.sign(
      { id: newUser._id, role: newUser.role, sessionId: session._id },
      config.JWT_SECRET,
      {
        expiresIn: "3h",
      }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "User registered successfully",
      newUser,
      accessToken: accessToken,
    });
  } catch (err) {
    console.error("Error occurred while registering user:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function login(req, res) {
  try {
    const { emailId, password } = req.body;

    const user = await userModel.findOne({ emailId });
    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      config.JWT_SECRET,
      {
        expiresIn: "7d",
      }
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
      {
        expiresIn: "15m",
      }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ message: "Login successful", user, accessToken });
  } catch (err) {
    console.error("Error occurred while logging in user:", err);
    res.status(500).json({ message: "Server error" });
  }
}

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
      sameSite: "none",
      secure: true,
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Error occurred while logging out user:", err);
    res.status(500).json({ message: "Server error" });
  }
}

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
      sameSite: "none",
      secure: true,
    });
    res.status(200).json({ message: "All sessions logged out successfully" });
  } catch (err) {
    console.error("Error occurred while logging out all sessions:", err);
    res.status(500).json({ message: "Server error" });
  }
}

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
      sameSite: "none",
      secure: true,
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
