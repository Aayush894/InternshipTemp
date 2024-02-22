import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, age, address } = req.body;

  if (
    [username, email, password, age, address].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // check for valid username format ie. only in lowercase
  const isValidUsername = (username) => {
    const usernameRegex = /^[a-z]+\d*$/;
    return usernameRegex.test(username);
  }

  // check for valid email id
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // check for valid age
  const isValidAge = (age) => {
    return Number.isInteger(age) && age > 0;
  }

  // check for valid address
  const isValidAddress = (address) => {
    return address.trim() !== "";
  }
  
  if (!isValidUsername(username)) {
    throw new ApiError(400, "Username must consist of lowercase letters followed by digits");
  }

  if (!isValidEmail(email)) {
    throw new ApiError(400, "Invalid email address");
  }

  if (!isValidAge(age)) {
    throw new ApiError(400, "Age must be a positive integer");
  }

  if (!isValidAddress(address)) {
    throw new ApiError(400, "Address cannot be empty");
  }

  const salt = await bcrypt.genSalt(10);
  const securePassword = await bcrypt.hash(req.body.password, salt);

  const user = await User.create({
    username,
    email,
    password: securePassword,
    age,
    address,
  });

  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong when registering a user");
  }

  return res
    .status(201)
    .json({ success: true, message: "User registered successfully" });
});

const loginUser = asyncHandler(async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ errors: error.array() });
  }

  const { email, username, password } = req.body;

  if (!email && !username) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Credentials");
  }

  const authToken = await user.generateAuthToken();

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("authToken", authToken, options)
    .json({ success: true, authToken });
});

const logoutUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("authToken")
    .json({ status: true, message: "User Logged Out" });
});

const updatePass = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const authToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "") ||
      "";

    if (!authToken) {
      throw new ApiError(401, "Unauthorised request");
    }

    const decodedToken = jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    const salt = await bcrypt.genSalt(10);
    const secureNewPassword = await bcrypt.hash(newPassword, salt);

    user.password = secureNewPassword;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while changing password",
    });
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const { username, email, age, address } = req.body;

  if (!username || !email || !age || !address) {
    throw new ApiError(400, "All fields are required");
  }

  try {
    const authToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "") ||
      "";

    if (!authToken) {
      throw new ApiError(401, "Unauthorised request");
    }

    const decodedToken = jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findByIdAndUpdate(
      decodedToken?._id,
      {
        $set: {
          username,
          email,
          age,
          address,
        },
      },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      status: true,
      user,
      message: "Account details updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while changing password",
    });
  }
});

export { registerUser, loginUser, logoutUser, updatePass, updateUser };
