import React from "react";
import { CheckCircle2, Circle, Clock, TrendingUp, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { Task, CategoryTheme } from "../types";

interface DashboardProps {
  tasks: Task[];
  themes: CategoryTheme;
  onToggleStatus: (id: string, completed: boolean) => void;
  onNavigateToKelola: () => void;
}

export default function Dashboard({ tasks, themes, onToggleStatus, onNavigateToKelola }: DashboardProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  // Find nearest incomplete tasks with deadlines as "Tugas Mendesak"
  const pendingWithDeadline = tasks
    .filter(t => !t.completed && t.deadline)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  // Motivational quote based on task load
  const getMotivationalText = () => {
    if (totalTasks === 0) {
      return {
        title: "Selamat Datang di MyTask!",
        quote: "Mulai petualangan belajarmu dengan mencatat tugas pertama di Menu 'Kelola Tugas'. Hubungkan dengan ekstraktor warna untuk tema kustom yang asri!"
      };
    }
    const percent = Math.round((completedTasks / totalTasks) * 105);
    if (percent === 100) {
      return {
        title: "Luar Biasa! Semua Tugas Tuntas!",
        quote: "Kamu telah menyelesaikan seluruh agenda kerjamu dengan sangat baik. Istirahat sejenak untuk mengisi kembali energimu."
      };
    } else if (percent >= 50) {
      return {
        title: "Ayo, Sedikit Lagi Selesai!",
        quote: "Lebih dari separuh agenda telah tercapai. Pertahankan fokusmu dan nikmati alur pengerjaan yang terorganisir."
      };
    } else {
      return {
        title: "Satu Demi Satu, Pasti Bisa!",
        quote: "Jangan biarkan tumpukan pekerjaan membuatmu cemas. Pecah tugas menjadi bagian-bagian kecil, lalu selesaikan perlahan."
      };
    }
  };

  const motivation = getMotivationalText();

  // Category symbols representation
  const getCategorySymbol = (cat: string) => {
    switch (cat) {
      case "Kuliah": return "📚";
      case "Organisasi": return "🤝";
      case "Pribadi": return "🏡";
      default: return "📝";
    }
  };

  return (
    <div id="dashboard-page" className="space-y-10 animate-fade-in">
      {/* Editorial Welcome Header wrapped in Brutalist offset card */}
      <div className="bg-white p-8 border-2 border-brand-plum relative shadow-[6px_6px_0px_rgba(61,21,52,1)]">
        <div className="relative z-10 space-y-3">
          <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase bg-brand-biscuit border border-brand-plum px-3 py-1 text-brand-plum inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> TASKFLOW INTEL LOKAL
          </span>
          <h2 className="text-3xl sm:text-5xl text-brand-plum uppercase font-black leading-tight tracking-tight font-serif">
            {motivation.title}
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed italic font-serif">
            &ldquo;{motivation.quote}&rdquo;
          </p>
        </div>
      </div>

      {/* Statistics Counter Requested Specifically by User - Now Brutalist Solid-Offset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Tasks */}
        <div className="p-5 bg-white border-2 border-brand-plum shadow-[4px_4px_0px_#3E4B8E] flex items-center gap-4 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#3D1534]">
          <div className="p-3 bg-brand-biscuit border border-brand-plum text-brand-plum">
            <TrendingUp className="w-6 h-6 stroke-[3px]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-brand-navy uppercase tracking-widest">Total Tugas</p>
            <p className="text-4xl font-black text-brand-plum font-serif mt-0.5">{totalTasks < 10 ? `0${totalTasks}` : totalTasks}</p>
          </div>
        </div>

        {/* Completed */}
        <div className="p-5 bg-white border-2 border-brand-plum shadow-[4px_4px_0px_#A6BCC9] flex items-center gap-4 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#3D1534]">
          <div className="p-3 bg-brand-slate border border-brand-plum text-brand-plum">
            <CheckCircle2 className="w-6 h-6 stroke-[3px]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-brand-navy uppercase tracking-widest">Selesai</p>
            <p className="text-4xl font-black text-brand-plum font-serif mt-0.5">{completedTasks < 10 ? `0${completedTasks}` : completedTasks}</p>
          </div>
        </div>

        {/* Pending */}
        <div className="p-5 bg-white border-2 border-brand-plum shadow-[4px_4px_0px_#F6E0B6] flex items-center gap-4 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#3D1534]">
          <div className="p-3 bg-[#FFEBA7] border border-brand-plum text-brand-plum">
            <Clock className="w-6 h-6 stroke-[3px]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-brand-navy uppercase tracking-widest">Belum Selesai</p>
            <p className="text-4xl font-black text-brand-plum font-serif mt-0.5">{pendingTasks < 10 ? `0${pendingTasks}` : pendingTasks}</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Urgent Items and Quick Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Urgent Deadlines */}
        <div className="lg:col-span-7 bg-white p-6 border-2 border-brand-plum shadow-[6px_6px_0px_rgba(61,21,52,1)] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-brand-plum pb-3">
            <h2 className="text-xl font-bold font-serif text-brand-plum uppercase tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-slate stroke-[2.5px]" /> Tugas Mendesak
            </h2>
            <button
              onClick={onNavigateToKelola}
              className="text-xs font-black text-brand-navy uppercase tracking-wider hover:underline transition-all flex items-center gap-1 cursor-pointer"
            >
              Kelola Semua <ArrowRight className="w-3.5 h-3.5 stroke-[3px]" />
            </button>
          </div>

          {pendingWithDeadline.length > 0 ? (
            <div className="divide-y-2 divide-brand-plum/10">
              {pendingWithDeadline.map((task) => {
                const catColor = themes[task.category] || "#A6BCC9";
                return (
                  <div key={task.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5 select-none">{getCategorySymbol(task.category)}</span>
                      <div>
                        <p className="font-bold text-brand-plum text-sm sm:text-base">{task.title}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span
                            className="text-[9px] font-black uppercase px-2 py-0.5 border border-brand-plum text-white"
                            style={{ backgroundColor: catColor }}
                          >
                            {task.category}
                          </span>
                          <span className="text-xs text-gray-700 font-bold flex items-center gap-1">
                            <Calendar className="w-3 h-3 stroke-[2.5px]" /> {task.deadline}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2 italic font-serif">{task.description}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleStatus(task.id, true)}
                      className="px-3 py-1.5 text-xs font-black uppercase text-brand-plum bg-brand-biscuit hover:bg-brand-slate border-2 border-brand-plum shadow-[2px_2px_0px_rgba(61,21,52,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      Selesai
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p className="text-sm font-bold uppercase">Tidak ada tugas mendesak!</p>
              <p className="text-xs mt-1">Semua aman terkendali.</p>
            </div>
          )}
        </div>

        {/* Right Column: Mini Education or Theme Palette Showcase */}
        <div className="lg:col-span-5 bg-white border-2 border-brand-plum p-6 text-brand-plum space-y-6 shadow-[6px_6px_0px_#3E4B8E]">
          <div>
            <h3 className="text-xl font-serif text-brand-plum uppercase font-black tracking-tight border-b-2 border-brand-plum pb-2">Panduan Visual</h3>
            <p className="text-xs text-gray-700 leading-relaxed mt-2">
              Setiap kategori tugas dilengkapi dengan warna penanda visual khusus. Ini membantu memudahkan Anda mengidentifikasi prioritas serta jenis agenda belajar hanya dalam sekali lirik!
            </p>
          </div>

          {/* Current Category Themes visualization */}
          <div className="space-y-3 bg-brand-bg/50 p-4 border-2 border-brand-plum">
            <h4 className="text-[10px] font-black tracking-wider uppercase text-brand-plum">Skema Warna Kategori Anda</h4>
            <div className="space-y-2.5">
              {Object.entries(themes).map(([catName, colorHex]) => (
                <div key={catName} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{getCategorySymbol(catName)}</span>
                    <span className="font-bold text-brand-plum">{catName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold">{colorHex}</span>
                    <span
                      className="w-5 h-5 rounded-none border-2 border-brand-plum shadow-[1px_1px_0px_black]"
                      style={{ backgroundColor: colorHex }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#3D1534]/50">MyTask Premium &bull; Framework React + Express</p>
          </div>
        </div>
      </div>
    </div>
  );
}
