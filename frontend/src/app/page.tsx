"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    Plus,
    History,
    Activity,
    Clock,
    CheckCircle2,
    ArrowRight,
    FileText,
    Loader2
} from "lucide-react";

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

    // นับโปรเจกต์ที่สร้างวันนี้
    const today = new Date().toDateString();
    const todayCount = projects.filter(p => new Date(p.createdAt).toDateString() === today).length;

    // แปลง result string -> object เพื่อดึง cell_count
    const getCellCount = (result: string | null) => {
        if (!result) return "-";
        try {
            const parsed = JSON.parse(result);
            return parsed.cell_count || "-";
        } catch { return "-"; }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
    };

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
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="p-4 bg-white rounded-xl shadow-sm">
                        <Activity className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-800">
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : projects.length}
                        </h3>
                        <p className="text-blue-600 text-sm font-medium">โปรเจกต์ทั้งหมด</p>
                    </div>
                </div>

                <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="p-4 bg-white rounded-xl shadow-sm">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-800">
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : todayCount}
                        </h3>
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
                            <FileText className="w-5 h-5 text-slate-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">โปรเจกต์ล่าสุด</h2>
                    </div>
                    <Link href="/dashboard/history" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium hover:underline">
                        ดูทั้งหมด <ArrowRight className="w-4 h-4" />
                    </Link>
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
                                {projects.slice(0, 10).map((project) => (
                                    <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 pl-6 font-bold text-slate-700">{project.name}</td>
                                        <td className="p-4 text-slate-600">
                                            <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold mr-2">
                                                {project.drugName || "N/A"}
                                            </span>
                                            <span className="text-slate-400">{project.concentration || "-"}</span>
                                        </td>
                                        <td className="p-4 text-slate-500 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-300" /> {formatDate(project.createdAt)}
                                        </td>
                                        <td className="p-4 font-bold text-slate-800">{getCellCount(project.result)}</td>
                                        <td className="p-4 text-center">
                                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 inline-flex items-center gap-1">
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