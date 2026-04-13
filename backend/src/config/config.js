import dotenv from "dotenv";
dotenv.config();

if (!process.env.PORT) {
  throw new Error("PORT is not defined in the environment variables");
}

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in the environment variables");
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables");
}
if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error(
    "GOOGLE_CLIENT_ID is not defined in the environment variables",
  );
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "GOOGLE_CLIENT_SECRET is not defined in the environment variables",
  );
}
if (!process.env.GOOGLE_REFRESH_TOKEN) {
  throw new Error(
    "GOOGLE_REFRESH_TOKEN is not defined in the environment variables",
  );
}
if (!process.env.GOOGLE_USER) {
  throw new Error("GOOGLE_USER is not defined in the environment variables");
}

export const config = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  RAPIDAPI_KEY: process.env.RAPIDAPI_KEY,
  RAPIDAPI_HOST: process.env.RAPIDAPI_HOST,
  JUDGE0_URL: process.env.JUDGE0_URL || "https://ce.judge0.com",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
  GOOGLE_USER: process.env.GOOGLE_USER,
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
};