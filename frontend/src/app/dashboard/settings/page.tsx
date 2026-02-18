"use client";
import { Moon, Sun, Monitor } from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [theme, setTheme] = useState("light");

  // โหลดค่าธีมตอนเปิดหน้า
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (t: string) => {
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const handleThemeChange = (t: string) => {
    setTheme(t);
    localStorage.setItem("theme", t); // ✅ บันทึกค่าลงเครื่อง
    applyTheme(t);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white">ตั้งค่าระบบ</h1>
      
      {/* Profile Card (Fixed Data) */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-white">KM</span>
        </div>
        <div className="text-center md:text-left space-y-2">
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">ชื่อบัญชีผู้ใช้</label>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Khajohn Muenbal</h2>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">อีเมล</label>
                <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">test5@gmail.com</p>
            </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
         <h3 className="text-xl font-bold text-slate-700 dark:text-white mb-6 flex items-center gap-2"><Monitor className="w-5 h-5"/> การแสดงผล (Theme)</h3>
         <div className="grid grid-cols-3 gap-4">
            <button onClick={() => handleThemeChange('light')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-300 dark:border-slate-600'}`}>
                <Sun className={`w-8 h-8 ${theme === 'light' ? 'text-blue-600' : 'text-slate-400'}`}/>
                <span className={`font-bold ${theme === 'light' ? 'text-blue-700' : 'text-slate-500'}`}>Light Mode</span>
            </button>
            <button onClick={() => handleThemeChange('dark')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'dark' ? 'border-blue-500 bg-slate-800' : 'border-slate-100 hover:border-slate-300 dark:border-slate-600'}`}>
                <Moon className={`w-8 h-8 ${theme === 'dark' ? 'text-white' : 'text-slate-400'}`}/>
                <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-500'}`}>Dark Mode</span>
            </button>
            <button onClick={() => handleThemeChange('system')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'system' ? 'border-blue-500 bg-slate-100' : 'border-slate-100 hover:border-slate-300 dark:border-slate-600'}`}>
                <Monitor className={`w-8 h-8 ${theme === 'system' ? 'text-blue-600' : 'text-slate-400'}`}/>
                <span className={`font-bold ${theme === 'system' ? 'text-blue-700' : 'text-slate-500'}`}>System</span>
            </button>
         </div>
      </div>
    </div>
  );
}