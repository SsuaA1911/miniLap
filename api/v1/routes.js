import express from "express";
import userRoutes from "./turso/users.js";
import notesRoutes from "./turso/notes.js";
import mongoUsers from "./mongo/users.js";
import mongoNotes from "./mongo/notes.js";

const router = express.Router();

export default (db) => {
  router.use(userRoutes(db));
  router.use(notesRoutes(db));
  router.use("/mongo", mongoUsers);
  router.use("/mongo", mongoNotes);
  return router;
};
