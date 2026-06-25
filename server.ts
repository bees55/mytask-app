import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Ensure database directory exists
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const TASKS_FILE = path.join(DATA_DIR, "tasks.json");
const THEMES_FILE = path.join(DATA_DIR, "themes.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// Default Category Themes
const DEFAULT_THEMES = {
  "Kuliah": "#A6BCC9", // Calm slate blue
  "Organisasi": "#F6E0B6", // Warm biscuit gold
  "Pribadi": "#3E4B8E", // Indigo navy
  "Lainnya": "#3D1534", // Deep plum
};

// Helper to read JSON database safely
function readJSONFile(filePath: string, defaultValue: any) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultValue;
  }
}

// Helper to write JSON database safely
function writeJSONFile(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// Password hashing function
function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

app.use(express.json());

// --- API AUTH ENDPOINTS ---

// POST /api/auth/register - Register a new user
app.post("/api/auth/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username dan password tidak boleh kosong" });
  }

  const trimmedUsername = username.trim().toLowerCase();
  if (trimmedUsername.length < 3) {
    return res.status(400).json({ error: "Username minimal 3 karakter" });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: "Password minimal 4 karakter" });
  }

  const users = readJSONFile(USERS_FILE, []);
  const userExists = users.some((u: any) => u.username === trimmedUsername);
  if (userExists) {
    return res.status(400).json({ error: "Username sudah terdaftar" });
  }

  const newUser = {
    id: Date.now().toString(),
    username: trimmedUsername,
    password: hashPassword(password),
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeJSONFile(USERS_FILE, users);

  res.status(201).json({
    id: newUser.id,
    username: newUser.username,
    message: "Registrasi sukses!"
  });
});

// POST /api/auth/login - Login existing user
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username dan password tidak boleh kosong" });
  }

  const trimmedUsername = username.trim().toLowerCase();
  const users = readJSONFile(USERS_FILE, []);
  const user = users.find((u: any) => u.username === trimmedUsername);

  if (!user || user.password !== hashPassword(password)) {
    return res.status(401).json({ error: "Username atau password salah" });
  }

  res.json({
    id: user.id,
    username: user.username,
    message: "Login sukses!"
  });
});

// --- API TASK ENDPOINTS (USER-SCOPED) ---

// GET /api/tasks - Retrieve all tasks for the logged in user
app.get("/api/tasks", (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) {
    return res.status(401).json({ error: "Silakan login terlebih dahulu" });
  }

  const tasks = readJSONFile(TASKS_FILE, []);
  // Filter only tasks belonging to this user
  const userTasks = tasks.filter((t: any) => t.userId === userId);
  res.json(userTasks);
});

// POST /api/tasks - Create a new task for the logged in user
app.post("/api/tasks", (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) {
    return res.status(401).json({ error: "Silakan login terlebih dahulu" });
  }

  const { title, description, category, deadline } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Nama tugas tidak boleh kosong" });
  }

  const tasks = readJSONFile(TASKS_FILE, []);
  const newTask = {
    id: Date.now().toString(),
    userId,
    title,
    description: description || "",
    category: category || "Lainnya",
    deadline: deadline || "",
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.unshift(newTask); // Add to the top of the list
  writeJSONFile(TASKS_FILE, tasks);
  res.status(201).json(newTask);
});

// PUT /api/tasks/:id - Update status (Toggle complete / Editing) with user check
app.put("/api/tasks/:id", (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) {
    return res.status(401).json({ error: "Silakan login terlebih dahulu" });
  }

  const { id } = req.params;
  const { completed, title, description, category, deadline } = req.body;
  const tasks = readJSONFile(TASKS_FILE, []);

  const taskIndex = tasks.findIndex((t: any) => t.id === id && t.userId === userId);
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Tugas tidak ditemukan" });
  }

  // Update provided fields
  if (completed !== undefined) tasks[taskIndex].completed = completed;
  if (title !== undefined) tasks[taskIndex].title = title;
  if (description !== undefined) tasks[taskIndex].description = description;
  if (category !== undefined) tasks[taskIndex].category = category;
  if (deadline !== undefined) tasks[taskIndex].deadline = deadline;

  writeJSONFile(TASKS_FILE, tasks);
  res.json(tasks[taskIndex]);
});

// DELETE /api/tasks/:id - Delete a task with user check
app.delete("/api/tasks/:id", (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) {
    return res.status(401).json({ error: "Silakan login terlebih dahulu" });
  }

  const { id } = req.params;
  const tasks = readJSONFile(TASKS_FILE, []);

  const filteredTasks = tasks.filter((t: any) => !(t.id === id && t.userId === userId));
  if (tasks.length === filteredTasks.length) {
    return res.status(404).json({ error: "Tugas tidak ditemukan" });
  }

  writeJSONFile(TASKS_FILE, filteredTasks);
  res.json({ message: "Tugas berhasil dihapus" });
});

// GET /api/themes - Get user categories & active hex colors
app.get("/api/themes", (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  const allThemes = readJSONFile(THEMES_FILE, {});
  
  if (userId && allThemes[userId]) {
    res.json(allThemes[userId]);
  } else {
    res.json(DEFAULT_THEMES);
  }
});

// POST /api/themes - Update color for a category per user
app.post("/api/themes", (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) {
    return res.status(401).json({ error: "Silakan login terlebih dahulu" });
  }

  const { category, color } = req.body;
  if (!category || !color) {
    return res.status(400).json({ error: "Kategori dan warna tidak boleh kosong" });
  }

  const allThemes = readJSONFile(THEMES_FILE, {});
  if (!allThemes[userId]) {
    allThemes[userId] = { ...DEFAULT_THEMES };
  }

  allThemes[userId][category] = color;
  writeJSONFile(THEMES_FILE, allThemes);
  res.json(allThemes[userId]);
});

// --- VITE DEV / PRODUCTION INTEGRATION ---

const isProd = process.env.NODE_ENV === "production";

async function startServer() {
  if (!isProd) {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    // Serve frontend via Vite dev middleware
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files from compiled dist
    app.use(express.static(distPath));
    
    // SPA routing - always fallback to index.html
    app.get("/*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files server loaded.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MyTask Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
