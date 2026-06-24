import React, { useState } from "react";
import { User, Lock, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (user: { id: string; username: string }) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!username.trim() || !password) {
      setErrorMsg("Username dan password wajib diisi");
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setErrorMsg("Konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Terjadi kesalahan pada sistem");
      }

      if (isRegister) {
        setSuccessMsg("Registrasi sukses! Silakan masuk dengan akun Anda.");
        setIsRegister(false);
        setPassword("");
        setConfirmPassword("");
      } else {
        onLoginSuccess({ id: data.id, username: data.username });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal tersambung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-12 relative z-10">
      <div className="bg-white p-8 border-2 border-brand-plum shadow-[8px_8px_0px_rgba(61,21,52,1)] relative">
        <div className="space-y-2 text-center mb-8">
          <span className="text-[10px] font-black tracking-widest uppercase bg-brand-biscuit border border-brand-plum px-3 py-1 text-brand-plum inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> MYTASK SECURE ACCESS
          </span>
          <h2 className="text-3xl font-black text-brand-plum uppercase font-serif tracking-tight leading-none pt-2">
            {isRegister ? "Buat Akun Baru" : "Masuk ke Akun"}
          </h2>
          <p className="text-xs text-gray-600 font-bold uppercase tracking-wide">
            {isRegister ? "Daftar untuk mengamankan data agenda Anda" : "Masukkan kredensial Anda untuk mengakses agenda"}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 bg-red-50 text-red-900 p-4 border-2 border-brand-plum shadow-[3px_3px_0px_black] text-xs flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-700 shrink-0 font-bold" />
            <p className="font-extrabold uppercase tracking-wide">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 bg-emerald-50 text-emerald-900 border-2 border-[#10b981] shadow-[3px_3px_0px_rgba(16,185,129,1)] p-4 text-xs flex items-center gap-2 uppercase font-black tracking-wide">
            <Sparkles className="w-5 h-5 text-emerald-800 shrink-0" />
            <p>{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-black text-brand-plum uppercase tracking-widest mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-plum stroke-[2.5px]" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="misal: budisetiadi"
                disabled={loading}
                className="w-full pl-11 pr-4 py-2.5 bg-white border-2 border-brand-plum text-sm text-brand-plum placeholder-gray-400 focus:outline-none focus:bg-brand-biscuit focus:ring-0 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-brand-plum uppercase tracking-widest mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-plum stroke-[2.5px]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full pl-11 pr-4 py-2.5 bg-white border-2 border-brand-plum text-sm text-brand-plum placeholder-gray-400 focus:outline-none focus:bg-brand-biscuit focus:ring-0 font-bold"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-black text-brand-plum uppercase tracking-widest mb-1.5">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-plum stroke-[2.5px]" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border-2 border-brand-plum text-sm text-brand-plum placeholder-gray-400 focus:outline-none focus:bg-brand-biscuit focus:ring-0 font-bold"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-navy text-white hover:bg-brand-plum py-3.5 border-2 border-brand-plum uppercase tracking-wider font-extrabold text-xs shadow-[4px_4px_0px_#3D1534] hover:shadow-[5px_5px_0px_#3D1534] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin stroke-[3px]" />
            ) : isRegister ? (
              "Daftar Akun Baru"
            ) : (
              "Masuk Sekarang"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-brand-plum/10 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="text-xs font-black uppercase tracking-wider text-brand-plum hover:underline cursor-pointer"
          >
            {isRegister
              ? "Sudah punya akun? Masuk di sini"
              : "Belum punya akun? Daftar di sini"}
          </button>
        </div>
      </div>
    </div>
  );
}
