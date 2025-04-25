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
    res.status(400).json({
      error: true,
      message: "All fields are required",
    });
  }
  try {
    const existingUser = await User.findOne({
      email,
    });
    if (existingUser) {
      res.status(409).json({
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
    res.status(400).json({
      error: true,
      message: "Email and password are required.",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        error: true,
        message: "Invalid credentials",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        error: true,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
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

export default router;
