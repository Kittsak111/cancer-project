"use client";
import Link from "next/link";
import { PlusCircle, Activity, History, Clock, FileText } from "lucide-react";

export default function DashboardPage() {
  // Mock Recent Projects
  const recentProjects = [
    { id: 101, name: "Test Cisplatin Case 1", date: "28/01/2026", cells: 120, status: "Success" },
    { id: 102, name: "Control Group B", date: "27/01/2026", cells: 85, status: "Success" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard ภาพรวม</h1>
          <p className="text-slate-500 mt-1">สรุปข้อมูลการวิเคราะห์โคโลนีเซลล์มะเร็ง</p>
        </div>
        <Link href="/dashboard/new" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 flex items-center gap-2 transition-all mt-4 md:mt-0">
          <PlusCircle className="w-5 h-5" /> สร้างโปรเจกต์ใหม่
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 flex items-center gap-4 shadow-sm">
          <div className="bg-white p-3 rounded-xl shadow-sm"><Activity className="text-blue-600 w-8 h-8"/></div>
          <div><h3 className="text-3xl font-bold text-blue-900">15</h3><p className="text-blue-700 text-sm font-medium">โปรเจกต์ทั้งหมด</p></div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 flex items-center gap-4 shadow-sm">
          <div className="bg-white p-3 rounded-xl shadow-sm"><Clock className="text-green-600 w-8 h-8"/></div>
          <div><h3 className="text-3xl font-bold text-green-900">2</h3><p className="text-green-700 text-sm font-medium">วิเคราะห์เสร็จวันนี้</p></div>
        </div>
        <Link href="/dashboard/history" className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer group">
          <div className="bg-purple-100 p-3 rounded-xl group-hover:bg-purple-200 transition-colors"><History className="text-purple-600 w-8 h-8"/></div>
          <div><h3 className="text-lg font-bold text-slate-800">ประวัติการวิเคราะห์</h3><p className="text-slate-500 text-sm">คลิกเพื่อดูและแก้ไขข้อมูล</p></div>
        </Link>
      </div>

      {/* Recent Projects Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2"><FileText className="w-5 h-5"/> โปรเจกต์ล่าสุด</h2>
            <Link href="/dashboard/history" className="text-sm text-blue-600 font-bold hover:underline">ดูทั้งหมด &rarr;</Link>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
                    <tr>
                        <th className="p-4 font-semibold">ชื่อโปรเจกต์</th>
                        <th className="p-4 font-semibold">วันที่</th>
                        <th className="p-4 font-semibold">จำนวนเซลล์</th>
                        <th className="p-4 font-semibold">สถานะ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {recentProjects.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-medium text-slate-800">{p.name}</td>
                            <td className="p-4 text-slate-500 text-sm">{p.date}</td>
                            <td className="p-4 text-slate-700 font-bold">{p.cells}</td>
                            <td className="p-4"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">{p.status}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}