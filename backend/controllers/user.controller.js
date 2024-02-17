import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";

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
    username,
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
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

  console.log(password);
  console.log(user);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Credentials");
  }

  const authToken = await user.generateAuthToken();
  console.log(authToken);

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
  console.log(req.cookie);
  console.log(req.body);

  return res
    .status(200)
    .clearCookie("authToken")
    .json({ status: true, message: "User Logged Out" });
});

const updatePass = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    // console.log(req.cookies) ;

    // const authToken = req.cookies?.accessToken || (req.header("Authorization")?.replace("Bearer ", "") || '');

    // console.log(authToken);

    // if(!authToken) {
    //     throw new ApiError(401, "Unauthorised request")
    // }

    // const decodedToken = jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET)

    const { username } = req.body;

    const user = await User.findOne({ username });

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
    return res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while changing password",
      });
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const { username } = req.body;
  console.log(username);

  const { email, age, address } = req.body;

  if (!username || !email || !age || !address) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findOneAndUpdate(
    { username },
    {
      $set: {
        email,
        age,
        address,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json({
      status: true,
      user,
      message: "Account details updated successfully",
    });
});

export { registerUser, loginUser, logoutUser, updatePass, updateUser };
