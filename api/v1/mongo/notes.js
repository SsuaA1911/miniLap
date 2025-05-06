import express from "express";
import { Notes } from "../../../modules/Note.js";
import {
  createNotes,
  editNotes,
  getAllNotes,
  addNote,
  searchNote,
  getUserNotes,
  deleteUserNote,
  togglePin,
  getNoteById,
  publicNoteUser,
  publicNoteUserById,
  updateNoteVisibility,
} from "./controllers/notescontroller.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { authUser } from "../../../middleware/auth.js";

const router = express.Router();

// get all users
router.get("/notes", getAllNotes);

// Create a user
router.post("/notes", createNotes);

// Add Note
router.post("/add-note", authUser, addNote);

//Edit Note
router.put("/edit-note/:noteId", authUser, editNotes);

//Update isPinned
router.put("/update-note-pinned/:noteId", togglePin);

//Get notes by user
router.get("/get-all-notes", authUser, getUserNotes);

//Delete note
router.delete("/delete-note/:noteId", authUser, deleteUserNote);

//Search notes
router.get("/search-notes", authUser, searchNote);

router.get("/get-note/:noteId", authUser, getNoteById);

// Get public profile by user ID
router.get("/public-profile/:userId", publicNoteUserById);

// Get public notes for a user
router.get("/public-notes/:userId", publicNoteUser);

// Update note visibility (publish/unpublish)
router.put("/notes/:noteId/visibility", authUser, updateNoteVisibility);

export default router;
