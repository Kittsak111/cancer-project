"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, History, Settings, LogOut, Microscope } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: "หน้าหลัก", href: "/dashboard", icon: LayoutDashboard },
    { name: "ประวัติย้อนหลัง", href: "/dashboard/history", icon: History },
    { name: "ตั้งค่า", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    // แก้ไข 1: เพิ่ม dark:bg-slate-900 ที่ div หลัก
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors duration-300">
      
      {/* แก้ไข 2: เพิ่ม dark:bg-slate-800 และ dark:border-slate-700 ที่ Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 fixed h-full hidden md:flex flex-col transition-colors duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Microscope className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-slate-800 dark:text-white text-lg">Cancer AI</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? "bg-blue-50 text-blue-700 font-semibold shadow-sm dark:bg-slate-700 dark:text-blue-300" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <Link href="/login" className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition">
            <LogOut className="w-5 h-5" />
            ออกจากระบบ
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        {children}
      </main>
    </div>
  );
}