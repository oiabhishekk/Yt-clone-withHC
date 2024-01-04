import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "../controllers/ErrorController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(globalErrorHandler);

app.all(
  "*",
  asyncHandler((req, res, next) => {
    let error = new Error("some errorr occured");
  })
);

export { app };
