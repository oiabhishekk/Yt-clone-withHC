import { User } from "../models/user.model.js";
import { emailRegex, passwordRegex } from "../src/constants.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadoncloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshToken = async (_id) => {
  try {
    const user = await User.findById(_id);
    let accessToken = user.generateAccessToken();
    let refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Error while generating access or refresh token"
    );
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  //get data from frontend
  const { userName, email, fullName, password } = req.body;
  //validation
  if (!userName?.length) throw new ApiError(400, "username is mandatory");
  if (emailRegex.test(email) == false)
    throw new ApiError(400, "Please type a valid email");
  if (!fullName?.length) throw new ApiError(400, "fullName is mandatory");
  if (passwordRegex.test(password) === false)
    throw new ApiError(
      400,
      " Password must be 8+ characters, with at least 1 uppercase, 1 lowercase, 1 digit, and special characters allowed."
    );

  //check if user is already registered
  const existedUser = await User.findOne({ $or: [{ userName }, { email }] });
  if (existedUser) throw new ApiError(409, "User already exist");

  //checck for images and avatar

  const avatarLocalPath = req.files?.avatar[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) throw new ApiError(409, "please upload avatar");
  let coverImageLink;
  if (coverImageLocalPath) {
    coverImageLink = await uploadoncloudinary(coverImageLocalPath);
  }

  //uplload them to cloudianry

  const avatarUrl = await uploadoncloudinary(avatarLocalPath);

  const user = await User.create({
    fullName,
    avatar: avatarUrl,
    coverImg: coverImageLink ? coverImageLink : "",
    email,
    password,
    userName: userName?.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});
export const loginUser = asyncHandler(async (req, res) => {
  //get data from req.body- username||email||password
  const { userName, email, password } = req.body;
  if (!(userName || email)) {
    throw new ApiError(400, "please provide username or email");
  }
  if (!password) {
    throw new ApiError(401, "please provide password");
  }
  let user = await User.findOne({ $or: [{ userName }, { email }] });
  if (!user) throw new ApiError(400, "user not found");

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Wrong credentials");
  }
  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
    user._id
  );
  if (!(refreshToken || accessToken)) throw new ApiError(500, "Try Again");
  const options = {
    secure: true,
    httpOnly: true,
  };
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});
export const logoutUser = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(429, "logout failed ");
  let loggedoutUser = await User.findByIdAndUpdate(
    req.user?._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});
