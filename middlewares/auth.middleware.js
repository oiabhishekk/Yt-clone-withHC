import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token) throw new ApiError(400, "Bad request");
  let decodedToken;

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, token) => {
    if (err) throw new ApiError(400, "Invalid token");
    decodedToken = token;
  });

  const user = await User.findById(decodedToken._id).select(
    "-password -accessToken"
  );
  if (!user) throw new ApiError(400, "Invalid access Token");
  req.user = user;
  next();
});
