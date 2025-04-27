import express from "express";
import { Notes } from "../../../modules/Note.js";
import { createNotes, getAllNotes } from "./controllers/notescontroller.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { authUser } from "../../../middleware/auth.js";

const router = express.Router();

// get all users
router.get("/notes", getAllNotes);

// Create a user
router.post("/notes", createNotes);

// Add Note
router.post("/add-note", authUser, async (req, res) => {
  const { title, content, tags = [], isPinned = false } = req.body;

  const { user } = req.user;

  if (!title || !content) {
    return res.status(400).json({
      error: true,
      message: "All fields required!",
    });
  }

  if (!user || !user._id) {
    return res.status(400).json({
      error: true,
      message: "Invalid user credentials!",
    });
  }

  try {
    const note = await Notes.create({
      title,
      content,
      tags,
      isPinned,
      userId: user._id,
    });

    await note.save();
    res.json({
      error: false,
      note,
      message: "Note added successfully!",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

//Edit Note
// router.put("/edit-note-pinned/:noteId")

//Update isPinned
// router.put("/update-note-pinned/:noteId");

//Get notes by user
router.post("/get-all-notes", authUser, async (req, res) => {
  const { user } = req.user;
  try {
    const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });
    res.json({
      err: false,
      notes,
      message: "All notes retreived!",
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

//Delete note
// router.delete("/delete-note/:noteId")

//Search notes
router.get("/search-note/", authUser, async (req, res) => {
  const { userId } = req.user;
  const { query } = req.query;
  if (!query) {
    return res
      .status(400)
      .json({ error: true, message: "Search query is required!" });
  }
  try {
    const matchingNotes = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
      ],
    });
    res.json({
      error: false,
      notes: matchingNotes,
      message: "Notes matching the search query retrieved success!",
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

export default router;
