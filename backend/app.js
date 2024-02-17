import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";

app.use(express.json());
app.use("/api/v1/users", userRouter);

// http://localhost:3000/api/v1/users/register

export { app };
