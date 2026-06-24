import React, { useState } from "react";
import { Plus, Trash2, Check, Search, Calendar, Tag, BookOpen, AlertCircle, RefreshCw } from "lucide-react";
import { Task, CategoryTheme } from "../types";

interface TaskListProps {
  tasks: Task[];
  themes: CategoryTheme;
  onAddTask: (taskData: { title: string; description: string; category: string; deadline: string }) => void;
  onToggleStatus: (id: string, completed: boolean) => void;
  onDeleteTask: (id: string) => void;
}

export default function TaskList({ tasks, themes, onAddTask, onToggleStatus, onDeleteTask }: TaskListProps) {
  // Local Form configuration
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Kuliah");
  const [deadline, setDeadline] = useState("");

  // Filters configurations
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("Semua");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("Semua");

  const [formError, setFormError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Nama tugas wajib diisi!");
      return;
    }
    setFormError("");
    onAddTask({
      title: title.trim(),
      description: description.trim(),
      category,
      deadline
    });

    // Reset fields
    setTitle("");
    setDescription("");
    setCategory("Kuliah");
    setDeadline("");
  };

  const getCategorySymbol = (cat: string) => {
    switch (cat) {
      case "Kuliah": return "📚";
      case "Organisasi": return "🤝";
      case "Pribadi": return "🏡";
      default: return "📝";
    }
  };

  // Filter Tasks dynamically
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategoryFilter === "Semua" || task.category === selectedCategoryFilter;
    
    let matchesStatus = true;
    if (selectedStatusFilter === "Selesai") {
      matchesStatus = task.completed;
    } else if (selectedStatusFilter === "Belum") {
      matchesStatus = !task.completed;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate if deadline is near or passed
  const getDeadlineStatus = (deadlineStr: string) => {
    if (!deadlineStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dlDate = new Date(deadlineStr);
    dlDate.setHours(0, 0, 0, 0);

    const diffTime = dlDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: "Terlewati", style: "bg-rose-100 text-rose-800 border-rose-300" };
    } else if (diffDays === 0) {
      return { text: "Hari Ini!", style: "bg-amber-100 text-amber-800 border-amber-300 animate-pulse" };
    } else if (diffDays <= 2) {
      return { text: `${diffDays} hari lagi`, style: "bg-amber-50 text-amber-800 border-amber-200" };
    } else {
      return { text: `${diffDays} hari tersisa`, style: "bg-emerald-50 text-emerald-800 border-emerald-100" };
    }
  };

  return (
    <div id="tasks-manager-container" className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* CREATE TASK COLUMN (Left) */}
        <div className="lg:col-span-5 bg-white p-6 border-2 border-brand-plum shadow-[6px_6px_0px_rgba(61,21,52,1)] space-y-6">
          <div className="border-b-2 border-brand-plum pb-4">
            <h2 className="text-xl font-bold font-serif text-brand-plum uppercase tracking-tight flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-slate stroke-[3px]" /> Tambah Tugas Baru
            </h2>
            <p className="text-xs text-gray-600 mt-1">Masukkan data rincian tugas kuliah, organisasi, atau pribadi Anda.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <div className="bg-red-50 text-red-900 p-3 border-2 border-brand-plum shadow-[3px_3px_0px_black] text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-700 font-bold" />
                <span className="font-bold uppercase tracking-wider">{formError}</span>
              </div>
            )}

            <div>
              <label htmlFor="task-title-input" className="block text-xs font-black text-brand-plum uppercase tracking-widest mb-1.5">
                Nama Tugas <span className="text-rose-600">*</span>
              </label>
              <input
                id="task-title-input"
                type="text"
                placeholder="misal: Mengerjakan UAS Dasar Pemrograman"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border-2 border-brand-plum text-sm text-brand-plum placeholder-gray-400 focus:outline-none focus:bg-brand-biscuit focus:ring-0"
              />
            </div>

            <div>
              <label htmlFor="task-descr-input" className="block text-xs font-black text-brand-plum uppercase tracking-widest mb-1.5">
                Deskripsi Tugas (Opsional)
              </label>
              <textarea
                id="task-descr-input"
                placeholder="Catatan pengerjaan, instruksi dosen..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border-2 border-brand-plum text-sm text-brand-plum placeholder-gray-400 focus:outline-none focus:bg-brand-biscuit focus:ring-0 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="task-category-select" className="block text-xs font-black text-brand-plum uppercase tracking-widest mb-1.5">
                  Kategori
                </label>
                <div className="relative">
                  <select
                    id="task-category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border-2 border-brand-plum text-sm text-brand-plum focus:outline-none focus:bg-brand-biscuit cursor-pointer font-bold"
                  >
                    <option value="Kuliah">📚 Kuliah</option>
                    <option value="Organisasi">🤝 Organisasi</option>
                    <option value="Pribadi">🏡 Pribadi</option>
                    <option value="Lainnya">📝 Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label id="task-deadline-label" className="block text-xs font-black text-brand-plum uppercase tracking-widest mb-1.5">
                  Deadline
                </label>
                <div className="relative">
                  <input
                    aria-labelledby="task-deadline-label"
                    type="date"
                    value={deadline}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border-2 border-brand-plum text-sm text-brand-plum focus:outline-none focus:bg-brand-biscuit cursor-pointer font-bold"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-navy text-white hover:bg-brand-plum py-3.5 border-2 border-brand-plum uppercase tracking-wider font-extrabold text-xs shadow-[4px_4px_0px_#3D1534] hover:shadow-[5px_5px_0px_#3D1534] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3px]" /> Tambah Agenda
            </button>
          </form>
        </div>

        {/* LIST & FILTER COLUMN (Right) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Search, Filter, Status Row in Brutalist Card style */}
          <div className="bg-white p-5 border-2 border-brand-plum shadow-[6px_6px_0px_rgba(61,21,52,1)] space-y-4">
            
            {/* Search Container */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-plum stroke-[2.5px]" />
              <input
                type="text"
                placeholder="Cari nama tugas atau instruksi deskripsi..."
                value={searchQuery}
                aria-label="Pencarian Tugas"
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border-2 border-brand-plum text-sm text-brand-plum placeholder-gray-400 focus:outline-none focus:bg-brand-biscuit focus:ring-0"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-brand-plum/10">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-black text-brand-plum uppercase tracking-wider mr-1">Saring:</span>
                {["Semua", "Kuliah", "Organisasi", "Pribadi", "Lainnya"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-3 py-1 border-2 border-brand-plum text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      selectedCategoryFilter === cat
                        ? "bg-brand-plum text-white shadow-[2px_2px_0px_rgba(61,21,52,0.3)]"
                        : "bg-white text-brand-plum hover:bg-brand-biscuit"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <span className="text-[10px] font-black text-brand-plum uppercase tracking-wider">Status:</span>
                <select
                  value={selectedStatusFilter}
                  aria-label="Status Saring"
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="px-2 py-1 bg-white text-brand-plum border-2 border-brand-plum text-xs font-black uppercase cursor-pointer focus:outline-none"
                >
                  <option value="Semua">Semua</option>
                  <option value="Belum">Belum Selesai</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
            </div>
          </div>

          {/* Render List cards */}
          <div className="space-y-5">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const catThemeColor = themes[task.category] || "#A6BCC9";
                const deadlineTag = getDeadlineStatus(task.deadline);
                const isCompleted = task.completed;

                return (
                  <div
                    key={task.id}
                    className={`bg-white border-2 border-brand-plum shadow-[5px_5px_0px_rgba(61,21,52,1)] hover:shadow-[6px_6px_0px_rgba(61,21,52,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] duration-150 transition-all overflow-hidden flex flex-col justify-between ${
                      isCompleted ? "opacity-80" : ""
                    }`}
                    style={{ borderLeft: `10px solid ${catThemeColor}` }}
                  >
                    <div className="p-5 flex items-start justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        {/* Upper Badges Row with retro box tags */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm select-none" role="img" aria-label={task.category}>
                            {getCategorySymbol(task.category)}
                          </span>
                          <span
                            className="text-[9px] font-black px-2 py-0.5 border border-brand-plum text-white uppercase tracking-wider"
                            style={{ backgroundColor: catThemeColor }}
                          >
                            {task.category}
                          </span>
                          {deadlineTag && (
                            <span className={`text-[9px] font-black px-2 py-0.5 border border-brand-plum uppercase tracking-wider ${deadlineTag.style}`}>
                              {deadlineTag.text}
                            </span>
                          )}
                          <span className="text-[10px] text-gray-500 font-bold">
                            TGL BUAT: {new Date(task.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                          </span>
                        </div>

                        {/* Title and Descr */}
                        <div>
                          <h3 className={`text-base sm:text-lg font-black text-brand-plum leading-tight uppercase font-serif ${
                            isCompleted ? "line-through text-gray-400 decoration-brand-plum/40 decoration-[3px]" : ""
                          }`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-xs text-gray-700 mt-2 whitespace-pre-line leading-relaxed pl-2 border-l-2 border-brand-plum font-serif italic bg-brand-bg/25 py-1 pr-2">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Deadline formatted line */}
                        {task.deadline && (
                          <div className="flex items-center gap-1.5 text-xs text-brand-plum font-black uppercase mt-1">
                            <Calendar className="w-3.5 h-3.5 stroke-[2.5px]" />
                            <span>Batas: {new Date(task.deadline).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                        )}
                      </div>

                      {/* Interactive completion toggle (Boxy retro version) */}
                      <button
                        onClick={() => onToggleStatus(task.id, !isCompleted)}
                        title={isCompleted ? "Tandai Belum Selesai" : "Tandai Selesai"}
                        className={`w-10 h-10 border-2 border-brand-plum flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          isCompleted
                            ? "bg-brand-slate text-brand-plum shadow-[1px_1px_0px_black]"
                            : "bg-white hover:bg-brand-biscuit shadow-[2px_2px_0px_#3D1534] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                        }`}
                      >
                        <Check className={`w-5 h-5 stroke-[4.5px] ${isCompleted ? "text-brand-plum" : "text-transparent"}`} />
                      </button>
                    </div>

                    {/* Bottom action drawer panel with thick outline */}
                    <div className="bg-brand-bg/30 px-5 py-3 border-t-2 border-brand-plum flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-brand-plum uppercase tracking-widest text-[9px]">Status:</span>
                        <span className={`font-black uppercase text-[10px] tracking-wider ${isCompleted ? "text-emerald-800" : "text-amber-900 bg-amber-150 px-1 border border-brand-plum"}`}>
                          {isCompleted ? "✓ Selesai" : "○ Proses"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Quick state alteration triggers */}
                        {!isCompleted && (
                          <button
                            onClick={() => onToggleStatus(task.id, true)}
                            className="bg-brand-biscuit hover:bg-brand-slate text-brand-plum border-2 border-brand-plum px-3 py-1 text-[11px] font-black uppercase shadow-[2px_2px_0px_#3D1534] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
                          >
                            ✓ Selesai
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="bg-white hover:bg-red-50 text-brand-plum border-2 border-brand-plum px-3 py-1 text-[11px] font-black uppercase shadow-[2px_2px_0px_#3D1534] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.5px]" /> Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white p-12 text-center border-2 border-brand-plum shadow-[4px_4px_0px_rgba(61,21,52,1)] text-gray-500">
                <BookOpen className="w-12 h-12 text-brand-slate mx-auto mb-3 stroke-[2px]" />
                <p className="text-base font-black uppercase tracking-wide text-brand-plum">Tidak ada tugas ditemukan</p>
                <p className="text-xs mt-1">Silakan tambah tugas di samping, atau setel ulang saringan filter Anda.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
