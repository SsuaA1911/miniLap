import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config();


export const db = createClient({
    url: process.env.TURSO_DB_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  // init tables - users, notes
// iffe  (immediately invoked function expression) - create an anonymous function and immediately execute
export const connectTurso = async () => {
 
    // Ping Turso
    try {
      await db.execute("SELECT 1");
      console.log("Checked successful communication with Turso database ✅");
    } catch (err) {
      console.error("❌ Failed to connect to Turso:", err);
      process.exit(1);
    }
    
      //Initialize Turso tables (users,notes)
      await db.execute(
        `CREATE TABLE IF NOT EXISTS notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          tags TEXT, --JSON-encoded array of strings
          is_pinned INTEGER DEFAULT 0,--0 =false,1=true
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          user_id INTEGER);
    
          `
      );
      await db.execute(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL);`
      );
    };