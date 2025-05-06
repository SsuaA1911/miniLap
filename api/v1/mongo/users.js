import express from "express";
import { User } from "../../../modules/User.js";
import {
  createAllUsers,
  getAllUsers,
  updateUser,
  deleteUser,
} from "./controllers/userscontroller.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { authUser } from "../../../middleware/auth.js";

const router = express.Router();

// get all users
router.get("/users", getAllUsers);

// Create a user
router.post("/users", createAllUsers);

// Update a user
router.put("/users/:id", updateUser);

// Delete a user
router.delete("/users/:id", deleteUser);

// Register a new user
router.post("/auth/register", async (req, res) => {
  const { fullName, email, password } = req.body;
  
  if (!fullName || !email || !password) {
    return res.status(400).json({
      error: true,
      message: "All fields are required",
    });
  }
  try {
    const existingUser = await User.findOne({ email, });
    if (existingUser) {
      return res.status(409).json({
        error: true,
        message: "Email already in use.",
      });
    }
    const user = new User({ fullName, email, password });
    await user.save();

    res.status(201).json({
      error: false,
      message: "Created user successful!",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
});

//login a user
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: "Email and password are required.",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: true,
        message: "Invalid credentials 71",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: true,
        message: "Invalid credentials 78",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    //jwt.sign => เหมือนกับให้ CEO มา sign งาน => รับพารามิเตอร์ 3 ส่วน
    //ส่วนที่ 1 เปรียบเหมือนกับแม่คุณแจ
    //ส่วนที่ 2 เปรียบเหมือนกับคุณแจ
    //ส่วนที่ 3 เปรียบเหมือนว่าคุณสามารถใช้งานได้ภายในเวลาเท่าไร

    return res.json({
      error: false,
      token,
      message: "Login successful!",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
});

// Login a user - jwt signed token
router.post("/auth/cookie/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // 1 hour expiration
    });

    const isProd = process.env.NODE_ENV === "production";

    // Set token in HttpOnly cookie
    // res.cookie("accessToken", token, {
    //   httpOnly: true,
    //   secure: false,
    //   sameSite: "Strict", // helps prevent CSRF
    //   path: "/",
    //   maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
    // });
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProd, // only send over HTTPS in prod
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.status(200).json({
      error: false,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        fullName: user.fullName,
      }, // send some safe public info if needed
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: true, message: "Server error", details: err.message });
  }
});


// GET Current User Profile (protected route)
router.get("/auth/profile",authUser,async(req,res)=>{
  const user = User.findById(req.user.user._id).select("-password"); // exclude password
  if(!user){
    res.status(404).json({error: true, message: "User not found" })
  }

  res.status(200).json({error: false, user});
});

//LOGOUT
router.post("/auth/logout",(req,res)=>{
  res.clearCookie("accessToken",{
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({message: "Logged out successfully"});
});

//Verify token
router.get("/auth/verify",(req,res)=>{
  const token = req.headers.authorization?.split(" ")[1];
  if(!token){
    return res.status(401).json({error: true,message: "Token is required"})
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET,);
    res.json({
      error: false,
      userId: decoded.userId,
      message: "Token is valid",
    });
  } catch (error) {
    res.status(401).json({error: true,message: "Invalid token" });
  }
});

// ❌ Use after implementing auth
// Create User account
router.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName) {
    return res
      .status(400)
      .json({ error: true, message: "Full Name is required" });
  }

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }

  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });
  }

  const isUser = await User.findOne({ email: email });

  if (isUser) {
    return res.json({
      error: true,
      message: "User already exist",
    });
  }

  const user = new User({
    fullName,
    email,
    password,
  });

  await user.save();

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "36000m",
  });

  return res.json({
    error: false,
    user,
    accessToken,
    message: "Registration Successful",
  });
});

//Get User
router.get("/get-user", async (req, res) => {
  const { user } = req.user;

  const isUser = await User.findOne({ _id: user._id });

  if (!isUser) {
    return res.sendStatus(401);
  }

  return res.json({
    user: isUser,
    message: "",
  });
});

router.get("/auth/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({ user: req.user });
});

export default router;
