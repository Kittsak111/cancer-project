"use client";

import Link from "next/link";
import { 
  LayoutDashboard, 
  Plus, 
  History, 
  Activity, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  FileText
} from "lucide-react";

export default function DashboardPage() {
  // ✅ มีข้อมูลอยู่ 2 ชุด (Test Cisplatin Case 1 และ Control Group B)
  const recentProjects = [
    {
      id: "1",
      name: "Test Cisplatin Case 1",
      date: "28/01/2026", 
      count: 120,
      status: "Success",
      drug: "Cisplatin",
      conc: "10 uM"
    },
    {
      id: "2",
      name: "Control Group B",
      date: "27/01/2026",
      count: 85,
      status: "Success",
      drug: "None",
      conc: "-"
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl shadow-lg bg-blue-600 shadow-blue-200">
                <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Dashboard ภาพรวม</h1>
                <p className="text-slate-500 text-sm">สรุปข้อมูลการวิเคราะห์โคโลนีเซลล์มะเร็ง</p>
            </div>
        </div>
        <Link href="/dashboard/new">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all hover:shadow-lg">
                <Plus className="w-5 h-5" />
                สร้างโปรเจกต์ใหม่
            </button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Projects */}
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center gap-4 transition-all hover:shadow-md">
            <div className="p-4 bg-white rounded-xl shadow-sm">
                <Activity className="w-8 h-8 text-blue-600" />
            </div>
            <div>
                {/* ✅ จุดแก้ไข: ใช้ .length เพื่อนับจำนวน array (จะได้เลข 2 แน่นอนครับ) */}
                <h3 className="text-3xl font-bold text-slate-800">{recentProjects.length}</h3>
                <p className="text-blue-600 text-sm font-medium">โปรเจกต์ทั้งหมด</p>
            </div>
        </div>

        <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex items-center gap-4 transition-all hover:shadow-md">
            <div className="p-4 bg-white rounded-xl shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
                <h3 className="text-3xl font-bold text-slate-800">2</h3>
                <p className="text-green-600 text-sm font-medium">วิเคราะห์เสร็จวันนี้</p>
            </div>
        </div>

        <Link href="/dashboard/history" className="bg-purple-50 p-6 rounded-2xl border border-purple-100 flex items-center gap-4 transition-all hover:shadow-md hover:bg-purple-100 cursor-pointer group">
            <div className="p-4 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                <History className="w-8 h-8 text-purple-600" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800">ประวัติการวิเคราะห์</h3>
                <p className="text-purple-600 text-sm">คลิกเพื่อดูและแก้ไขข้อมูล</p>
            </div>
        </Link>
      </div>

      {/* Recent Projects Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <FileText className="w-5 h-5 text-slate-600"/>
                </div>
                <h2 className="text-lg font-bold text-slate-800">โปรเจกต์ล่าสุด</h2>
            </div>
            <Link href="/dashboard/history" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium hover:underline">
                ดูทั้งหมด <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                        <th className="p-4 pl-6">ชื่อโปรเจกต์</th>
                        <th className="p-4">ยา / ความเข้มข้น</th>
                        <th className="p-4">วันที่</th>
                        <th className="p-4">จำนวนเซลล์</th>
                        <th className="p-4 text-center">สถานะ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {recentProjects.map((project) => (
                        <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 pl-6 font-bold text-slate-700">{project.name}</td>
                            <td className="p-4 text-slate-600">
                                <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold mr-2">{project.drug}</span>
                                <span className="text-slate-400">{project.conc}</span>
                            </td>
                            <td className="p-4 text-slate-500 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-300"/> {project.date}
                            </td>
                            <td className="p-4 font-bold text-slate-800">{project.count}</td>
                            <td className="p-4 text-center">
                                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3"/> {project.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}