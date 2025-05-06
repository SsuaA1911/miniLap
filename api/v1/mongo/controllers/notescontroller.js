import { Notes } from "../../../../modules/Note.js";
import { User } from "../../../../modules/User.js";
import mongoose from "mongoose";

//get all note
export const getAllNotes = async (_req, res) => {
  try {
    const note = await Notes.find().sort({ createdAt: -1, isPinned: -1 });
    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to fetch all notes",
      details: err.message,
    });
  }
};
//Create anote
export const createNotes = async (req, res) => {
  const { title, content, tags = [], isPinned = false, userId } = req.body;
  try {
    const note = await Notes.create({
      title,
      content,
      tags,
      isPinned,
      userId,
    });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to fetch all notes",
      details: err.message,
    });
  }
};

export const editNotes = async (req, res) => {
  console.log("log body toy : ", req.body);
  //   console.log("editNOtesToy : ", req.params);
  const noteId = req.params.noteId;
  console.log("editNOtesToy : ", noteId);
  const { title, content, tags, isPinned } = req.body;
  const { user } = req.user;

  if (!title || !content) {
    return res.status(400).json({
      error: true,
      message: "Nochanges provided",
    });
  }
  try {
    const note = await Notes.findOne({ _id: noteId, userId: user._id });
    if (!note) {
      return res.status(404).json({
        error: true,
        message: "Note not fond",
      });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned) note.isPinned = true;

    await note.save(note);

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// Add note
// export const addNote = async (req, res) => {
//     const { title, content, tags = [], isPinned = false } = req.body;

//     const {user} = req.user;

//     if (!title || !content) {
//       return res.status(400).json({
//         error: true,
//         message: "All fields required!",
//       });
//     }

//     if (!user || !user._id) {
//       return res.status(400).json({
//         error: true,
//         message: "Invalid user credentials!",
//       });
//     }

//     try {
//       const note = await Notes.create({
//         title,
//         content,
//         tags,
//         isPinned,
//         userId: user._id,
//       });

//       await note.save();
//       res.json({
//         error: false,
//         note,
//         message: "Note added successfully!",
//       });
//     } catch (err) {
//       res.status(500).json({
//         error: true,
//         message: "Internal Server Error",
//       });
//     }
//   }
export const addNote = async (req, res) => {
  const { title, content, tags = [], isPinned = false } = req.body;

  const userId = req.user.user._id; // Logged-in user's MongoDB _id

  if (!title) {
    return res.status(400).json({ error: true, message: "Title is required" });
  }

  if (!content) {
    return res
      .status(400)
      .json({ error: true, message: "Content is required" });
  }

  if (!userId) {
    return res
      .status(401)
      .json({ error: true, message: "Unauthorized - no user ID found" });
  }

  try {
    const note = await Notes.create({
      title,
      content,
      tags,
      isPinned,
      userId, // 🔥 Save user as ObjectId reference
    });

    return res.status(201).json({
      error: false,
      note,
      message: "Note added successfully",
    });
  } catch (error) {
    console.error("Error creating note:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

export const searchNote = async (req, res) => {
  const { user } = req.user;
  const { query } = req.query;
  if (!query) {
    return res
      .status(400)
      .json({ error: true, message: "Search query is required!" });
  }
  try {
    const matchingNotes = await Notes.find({
      userId: user._id,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
        { tags: { $regex: new RegExp(query, "i") } },
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
};

//Get notes by user
export const getUserNotes = async (req, res) => {
  // console.log("test log req", req);

  const { user } = req.user;

  try {
    const notes = await Notes.find({ userId: user._id }).sort({ isPinned: -1 });
    return res.json({
      err: false,
      notes,
      message: "All notes retreived!",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// Delete Note
export const deleteUserNote = async (req, res) => {
  const noteId = req.params.noteId;
  const { user } = req.user;

  try {
    const note = await Notes.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    await Notes.deleteOne({ _id: noteId, userId: user._id });

    return res.json({
      error: false,
      message: "Note deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// Update isPinned
export const togglePin = async (req, res) => {
  const noteId = req.params.noteId;
  const { isPinned } = req.body;
  const { user } = req.user;

  try {
    const note = await Notes.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    note.isPinned = isPinned;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note pinned status updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

export const getNoteById = async (req, res) => {
  const noteId = req.params.noteId;
  const { user } = req.user;

  try {
    // Find the note by ID and ensure it belongs to the logged-in user
    const note = await Notes.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    return res.json({
      error: false,
      note,
      message: "Note retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching note:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

export const publicNoteUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "fullName email"
    );
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }
    res.status(200).json({ error: false, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Server error" });
  }
};

export const publicNoteUser = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: true, message: "Invalid user ID" });
  }

  try {
    const notes = await Notes.find({
      userId,
      isPublic: true, // Only fetch public notes
    }).sort({ createdOn: -1 }); // Sort by creation date (newest first)

    res.status(200).json({ error: false, notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Server error" });
  }
};

export const updateNoteVisibility = async (req, res) => {
  const { isPublic } = req.body;
  const { user } = req.user;

  try {
    const note = await Notes.findOneAndUpdate(
      { _id: req.params.noteId, userId: user._id }, // Ensure the note belongs to the user
      { isPublic },
      { new: true } // Return the updated note
    );

    if (!note) {
      return res
        .status(404)
        .json({ error: true, message: "Note not found or unauthorized" });
    }

    res.status(200).json({ error: false, note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Server error" });
  }
};
