import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoute from "./routes/auth.route.js";
import problemRoute from "./routes/problem.route.js";
import userRoute from "./routes/user.route.js";
import submitRoute from "./routes/submit.route.js";
import morgan from "morgan";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "./config/config.js";
import userModel from "./models/user.model.js";

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// CORS - allow frontend to talk to backend
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  })
);

// Passport - Google OAuth Strategy
app.use(passport.initialize());
passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this email
        const email = profile.emails[0].value;
        let user = await userModel.findOne({ emailId: email });

        if (user) {
          // User exists - return it
          return done(null, user);
        }

        // Create a new user from Google profile
        user = new userModel({
          firstName: profile.name.givenName || profile.displayName,
          lastName: profile.name.familyName || "",
          emailId: email,
          authProvider: "google",
          verified: true, // Google accounts are already verified
        });
        await user.save();

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Routes
app.use("/api/auth", authRoute);
app.use("/api/problems", problemRoute);
app.use("/api/user", userRoute);
app.use("/api/problemSubmitting", submitRoute);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

export default app;
