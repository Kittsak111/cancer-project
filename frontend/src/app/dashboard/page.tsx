"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, Activity, History, Clock, FileText, Loader2, CheckCircle2 } from "lucide-react";

interface Project {
  id: number;
  name: string;
  drugName: string | null;
  concentration: string | null;
  result: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProjects(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const today = new Date().toDateString();
  const todayCount = projects.filter(p => new Date(p.createdAt).toDateString() === today).length;

  const getCellCount = (result: string | null) => {
    if (!result) return "-";
    try { return JSON.parse(result).cell_count || "-"; } catch { return "-"; }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

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
          <div className="bg-white p-3 rounded-xl shadow-sm"><Activity className="text-blue-600 w-8 h-8" /></div>
          <div>
            <h3 className="text-3xl font-bold text-blue-900">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : projects.length}
            </h3>
            <p className="text-blue-700 text-sm font-medium">โปรเจกต์ทั้งหมด</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 flex items-center gap-4 shadow-sm">
          <div className="bg-white p-3 rounded-xl shadow-sm"><Clock className="text-green-600 w-8 h-8" /></div>
          <div>
            <h3 className="text-3xl font-bold text-green-900">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : todayCount}
            </h3>
            <p className="text-green-700 text-sm font-medium">วิเคราะห์เสร็จวันนี้</p>
          </div>
        </div>
        <Link href="/dashboard/history" className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer group">
          <div className="bg-purple-100 p-3 rounded-xl group-hover:bg-purple-200 transition-colors"><History className="text-purple-600 w-8 h-8" /></div>
          <div><h3 className="text-lg font-bold text-slate-800">ประวัติการวิเคราะห์</h3><p className="text-slate-500 text-sm">คลิกเพื่อดูและแก้ไขข้อมูล</p></div>
        </Link>
      </div>

      {/* Recent Projects Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2"><FileText className="w-5 h-5" /> โปรเจกต์ล่าสุด</h2>
          <Link href="/dashboard/history" className="text-sm text-blue-600 font-bold hover:underline">ดูทั้งหมด &rarr;</Link>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
              <p className="text-slate-400 text-sm">กำลังโหลด...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400">ยังไม่มีโปรเจกต์</p>
              <Link href="/dashboard/new" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                สร้างโปรเจกต์แรก →
              </Link>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
                <tr>
                  <th className="p-4 font-semibold">ชื่อโปรเจกต์</th>
                  <th className="p-4 font-semibold">ยา / ความเข้มข้น</th>
                  <th className="p-4 font-semibold">วันที่</th>
                  <th className="p-4 font-semibold">จำนวนเซลล์</th>
                  <th className="p-4 font-semibold">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.slice(0, 10).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{p.name}</td>
                    <td className="p-4 text-slate-600">
                      <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold mr-2">{p.drugName || "N/A"}</span>
                      <span className="text-slate-400">{p.concentration || "-"}</span>
                    </td>
                    <td className="p-4 text-slate-500 text-sm">{formatDate(p.createdAt)}</td>
                    <td className="p-4 text-slate-700 font-bold">{getCellCount(p.result)}</td>
                    <td className="p-4">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Success
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}