import React, { useState, useEffect } from "react";
import { CheckSquare, LayoutDashboard, ListTodo, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { Task, CategoryTheme, ActiveTab } from "./types";
import Dashboard from "./components/Dashboard";
import TaskList from "./components/TaskList";
import Login from "./components/Login";

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(() => {
    const saved = localStorage.getItem("mytask_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [themes, setThemes] = useState<CategoryTheme>({
    "Kuliah": "#A6BCC9",
    "Organisasi": "#F6E0B6",
    "Pribadi": "#3E4B8E",
    "Lainnya": "#3D1534",
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Fetch initial tasks and color themes on mount / login change
  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    async function loadData() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const [tasksRes, themesRes] = await Promise.all([
          fetch("/api/tasks", {
            headers: {
              "X-User-ID": currentUser ? currentUser.id : "",
            }
          }),
          fetch("/api/themes", {
            headers: {
              "X-User-ID": currentUser ? currentUser.id : "",
            }
          })
        ]);

        if (!tasksRes.ok || !themesRes.ok) {
          throw new Error("Gagal mengambil data dari server database");
        }

        const tasksData = await tasksRes.json();
        const themesData = await themesRes.json();

        setTasks(tasksData);
        setThemes(themesData);
      } catch (err) {
        console.error("Kesalahan sinkronisasi data:", err);
        setErrorMessage("Gagal menyinkronkan data dengan database. Menggunakan penyimpanan cadangan lokal.");
        
        // Fallback to localStorage if the Express API is not fully up yet during cold-starts
        if (currentUser) {
          const fallbackTasks = localStorage.getItem(`mytask_tasks_${currentUser.id}`);
          const fallbackThemes = localStorage.getItem(`mytask_themes_${currentUser.id}`);
          if (fallbackTasks) setTasks(JSON.parse(fallbackTasks));
          if (fallbackThemes) setThemes(JSON.parse(fallbackThemes));
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  // Sync state helpers
  const saveTasksLocalStorage = (updatedTasks: Task[]) => {
    if (currentUser) {
      localStorage.setItem(`mytask_tasks_${currentUser.id}`, JSON.stringify(updatedTasks));
    }
  };

  const saveThemesLocalStorage = (updatedThemes: CategoryTheme) => {
    if (currentUser) {
      localStorage.setItem(`mytask_themes_${currentUser.id}`, JSON.stringify(updatedThemes));
    }
  };

  // 2. Add dynamic task
  const handleAddTask = async (taskData: { title: string; description: string; category: string; deadline: string }) => {
    if (!currentUser) return;
    setErrorMessage(null);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-User-ID": currentUser.id
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error("Gagal menyimpan tugas baru di server database");
      }

      const newTask = await response.json();
      const updated = [newTask, ...tasks];
      setTasks(updated);
      saveTasksLocalStorage(updated);
    } catch (err) {
      console.error(err);
      // Fallback local modification
      const mockTask: Task = {
        id: Date.now().toString(),
        title: taskData.title,
        description: taskData.description,
        category: taskData.category,
        deadline: taskData.deadline,
        completed: false,
        createdAt: new Date().toISOString()
      };
      const updated = [mockTask, ...tasks];
      setTasks(updated);
      saveTasksLocalStorage(updated);
    }
  };

  // 3. Toggle Status
  const handleToggleStatus = async (id: string, completed: boolean) => {
    if (!currentUser) return;
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "X-User-ID": currentUser.id
        },
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) {
        throw new Error("Gagal mengupdate status tugas");
      }

      const updatedTask = await response.json();
      const updated = tasks.map(t => t.id === id ? updatedTask : t);
      setTasks(updated);
      saveTasksLocalStorage(updated);
    } catch (err) {
      console.error(err);
      // Fallback local operation
      const updated = tasks.map(t => t.id === id ? { ...t, completed } : t);
      setTasks(updated);
      saveTasksLocalStorage(updated);
    }
  };

  // 4. Delete Task
  const handleDeleteTask = async (id: string) => {
    if (!currentUser) return;
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          "X-User-ID": currentUser.id
        }
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus tugas");
      }

      const updated = tasks.filter(t => t.id !== id);
      setTasks(updated);
      saveTasksLocalStorage(updated);
    } catch (err) {
      console.error(err);
      // Fallback local operation
      const updated = tasks.filter(t => t.id !== id);
      setTasks(updated);
      saveTasksLocalStorage(updated);
    }
  };

  // 5. Update Theme Color from Extractor
  const handleThemeUpdate = async (category: string, color: string) => {
    if (!currentUser) return;
    setErrorMessage(null);
    try {
      const response = await fetch("/api/themes", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-User-ID": currentUser.id
        },
        body: JSON.stringify({ category, color }),
      });

      if (!response.ok) {
        throw new Error("Gagal mengupdate tema warna di server");
      }

      const updatedThemes = await response.json();
      setThemes(updatedThemes);
      saveThemesLocalStorage(updatedThemes);
    } catch (err) {
      console.error(err);
      // Fallback local operation
      const updated = { ...themes, [category]: color };
      setThemes(updated);
      saveThemesLocalStorage(updated);
    }
  };

  const handleLoginSuccess = (user: { id: string; username: string }) => {
    localStorage.setItem("mytask_user", JSON.stringify(user));
    setCurrentUser(user);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("mytask_user");
    setCurrentUser(null);
    setTasks([]);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-plum pb-16 flex flex-col items-center">
      
      {/* Decorative Organic Shapes matching our warm color codes */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-biscuit/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-brand-slate/25 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Container Container */}
      <div className="w-full max-w-5xl px-4 sm:px-6 relative z-10">
        
        {/* Editorial Bold Header Block */}
        <header className="py-10 my-4 text-center sm:text-left flex flex-col md:flex-row items-center sm:items-end justify-between gap-6 border-b-4 border-brand-plum pb-6">
          <div className="space-y-1">
            <h1 className="text-6xl sm:text-7xl font-black tracking-tighter text-brand-plum uppercase font-serif select-none leading-none">
              MyTask
            </h1>
            <p className="text-xs sm:text-sm font-bold text-brand-navy uppercase tracking-widest">
              {currentUser ? `Halo, ${currentUser.username} | Kelola Tugas & Kegiatan` : "Kelola Tugas Kuliah & Kegiatan dengan Mudah"}
            </p>
          </div>

          {/* Tab Selection controller with bold border & flat offset feel */}
          {currentUser && (
            <nav className="p-1 bg-white border-2 border-brand-plum shadow-[4px_4px_0px_rgba(61,21,52,1)] flex flex-wrap items-center gap-1 self-center sm:self-auto">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-2 text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-brand-navy text-white"
                    : "text-brand-navy hover:bg-brand-biscuit/40"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> Beranda
              </button>
              <button
                onClick={() => setActiveTab("kelola")}
                className={`px-4 py-2 text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "kelola"
                    ? "bg-brand-navy text-white"
                    : "text-brand-navy hover:bg-brand-biscuit/40"
                }`}
              >
                <ListTodo className="w-4 h-4" /> Kelola Tugas
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-xs sm:text-sm font-black uppercase tracking-wider bg-[#3D1534] text-white hover:bg-brand-navy transition-all cursor-pointer border-l-2 border-brand-plum"
              >
                Keluar
              </button>
            </nav>
          )}
        </header>

        {/* Sync Warn Alert Banner if any using boxy offset style */}
        {errorMessage && (
          <div className="mb-8 bg-amber-50 text-amber-800 p-4 border-2 border-brand-plum shadow-[3px_3px_0px_rgba(61,21,52,1)] text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
            <p className="font-extrabold uppercase tracking-wide">{errorMessage}</p>
          </div>
        )}

        {/* Core Layout Controller */}
        <main className="min-h-[50vh] relative">
          {!currentUser ? (
            <Login onLoginSuccess={handleLoginSuccess} />
          ) : isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center py-20 text-brand-navy space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-brand-slate" />
              <p className="text-sm font-semibold tracking-wider">Menghubungkan ke Database...</p>
            </div>
          ) : (
            <div className="transition-all duration-300">
              {activeTab === "dashboard" && (
                <Dashboard
                  tasks={tasks}
                  themes={themes}
                  onToggleStatus={handleToggleStatus}
                  onNavigateToKelola={() => setActiveTab("kelola")}
                />
              )}
              {activeTab === "kelola" && (
                <TaskList
                  tasks={tasks}
                  themes={themes}
                  onAddTask={handleAddTask}
                  onToggleStatus={handleToggleStatus}
                  onDeleteTask={handleDeleteTask}
                />
              )}
            </div>
          )}
        </main>

        {/* Footer info design credit block */}
        <footer className="mt-16 pt-8 border-t-2 border-brand-plum text-center space-y-2">
          <p className="text-xs font-extrabold uppercase tracking-wider text-brand-plum">
            MyTask &mdash; TaskFlow Dashboard Indonesia &copy; {new Date().getFullYear()}
          </p>
          <p className="text-xs font-black uppercase tracking-widest text-[#3D1534]/70">
            design by Bebee
          </p>
        </footer>

      </div>
    </div>
  );
}
