import { User } from "../../../../modules/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({ error: false, users });
  } catch (err) {
    res.json({
      error: true,
      message: "Failed to fetch users",
      details: err.message,
    });
  }
};

// Update userName
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  console.log(req, "test");

  try {
    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!updatedUser) return res.status(404).json("User not found");
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Server error",
    });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  console.log("testdelete", req);
  try {
    const deleteUser = await User.findOneAndDelete(id);
    if (deleteUser) {
      res.status(200).json("User Delete successfully");
    }
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Server error",
    });
  }
};

//Create q user

export const createAllUsers = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existing = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existing) {
      res.status(409).json({
        error: true,
        message: "Email or Username already in use!",
      });
    }
    // ตรวจสอบความยาวของรหัสผ่าน
    if (password.length < 6 || password.length > 30) {
      res.status(400).json({
        error: true,
        message: "Password must be at least 6 characters long!",
      });
    }

    //ตรวจสอบว่ารหัสผ่านมีตัวเลขหรือไม่
    if (!/\d/.test(password)) {
      res.status(400).json({
        error: true,
        message: "Password must contain at least one number!",
      });
    }
    //create and save new user
    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({
      error: false,
      user,
      message: "user created successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Server error",
      details: error.message,
    });
  }
};

