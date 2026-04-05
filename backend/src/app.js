import express from "express";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route.js";
import problemRoute from "./routes/problem.route.js";
import morgan from "morgan";

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/problems", problemRoute);

export default app;
