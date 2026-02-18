"use client";

import { useState, useEffect } from "react";
import {
    FileText, Calendar, Search, Save, Edit2, Trash2, Eye, Maximize, ZoomIn, X, Loader2, CheckCircle2, Clock
} from "lucide-react";

interface Project {
    id: number;
    name: string;
    drugName: string | null;
    concentration: string | null;
    description: string | null;
    result: string | null;
    createdAt: string;
}

const getSizeColor = (size: string) => {
    switch (size) {
        case 'Small': return '#EAB308';
        case 'Medium': return '#2563EB';
        case 'Large': return '#00FF00';
        default: return '#EAB308';
    }
};

export default function HistoryPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ name: "", drug: "", conc: "", desc: "" });
    const [savingId, setSavingId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // โหลดข้อมูลจาก DB
    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/projects");
            const data = await res.json();
            if (Array.isArray(data)) setProjects(data);
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("th-TH", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });
    };

    const parseResult = (result: string | null) => {
        if (!result) return null;
        try { return JSON.parse(result); } catch { return null; }
    };

    const startEdit = (project: Project) => {
        setEditingId(project.id);
        setEditForm({
            name: project.name,
            drug: project.drugName || "",
            conc: project.concentration || "",
            desc: project.description || "",
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const saveEdit = async (project: Project) => {
        setSavingId(project.id);
        try {
            const res = await fetch(`/api/projects/${project.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: editForm.name,
                    drugName: editForm.drug || null,
                    concentration: editForm.conc || null,
                    description: editForm.desc || null,
                    result: project.result,
                }),
            });
            if (res.ok) {
                setEditingId(null);
                fetchProjects(); // รีเฟรชข้อมูล
            } else {
                alert("บันทึกไม่สำเร็จ");
            }
        } catch {
            alert("เกิดข้อผิดพลาด");
        } finally {
            setSavingId(null);
        }
    };

    const deleteProject = async (id: number) => {
        if (!confirm("ยืนยันการลบโปรเจกต์นี้?")) return;
        try {
            const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
            if (res.ok) {
                setProjects(projects.filter(p => p.id !== id));
            } else {
                alert("ลบไม่สำเร็จ");
            }
        } catch {
            alert("เกิดข้อผิดพลาด");
        }
    };

    // กรองตาม search
    const filtered = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.drugName && p.drugName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl shadow-lg bg-emerald-600 shadow-emerald-200">
                        <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">ประวัติการวิเคราะห์</h1>
                        <p className="text-slate-500 text-sm">ทั้งหมด {projects.length} โปรเจกต์</p>
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                    <input
                        placeholder="ค้นหา..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-full text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"
                    />
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="bg-white rounded-2xl p-12 text-center border shadow-sm">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500 mb-2" />
                    <p className="text-slate-400">กำลังโหลดข้อมูล...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border shadow-sm">
                    <FileText className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-400">{searchQuery ? "ไม่พบผลลัพธ์" : "ยังไม่มีประวัติการวิเคราะห์"}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((project) => {
                        const result = parseResult(project.result);
                        const isEditing = editingId === project.id;
                        const distribution = result?.size_distribution || { Small: 0, Medium: 0, Large: 0 };
                        const total = (distribution.Small || 0) + (distribution.Medium || 0) + (distribution.Large || 0) || 1;

                        return (
                            <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                {/* Header */}
                                <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
                                    <div className="flex gap-4 items-center">
                                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {formatDate(project.createdAt)}
                                        </span>
                                        {isEditing ? (
                                            <input
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                className="font-bold text-slate-700 border rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <h3 className="font-bold text-slate-700">{project.name}</h3>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => deleteProject(project.id)}
                                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Left: Form */}
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500">ชื่อยา</label>
                                                    <input
                                                        disabled={!isEditing}
                                                        value={isEditing ? editForm.drug : (project.drugName || "")}
                                                        onChange={(e) => setEditForm({ ...editForm, drug: e.target.value })}
                                                        className="w-full p-2 border rounded-lg text-sm disabled:bg-slate-50 disabled:text-slate-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500">ความเข้มข้น</label>
                                                    <input
                                                        disabled={!isEditing}
                                                        value={isEditing ? editForm.conc : (project.concentration || "")}
                                                        onChange={(e) => setEditForm({ ...editForm, conc: e.target.value })}
                                                        className="w-full p-2 border rounded-lg text-sm disabled:bg-slate-50 disabled:text-slate-500"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500">รายละเอียด</label>
                                                <textarea
                                                    disabled={!isEditing}
                                                    value={isEditing ? editForm.desc : (project.description || "")}
                                                    onChange={(e) => setEditForm({ ...editForm, desc: e.target.value })}
                                                    rows={2}
                                                    className="w-full p-2 border rounded-lg text-sm disabled:bg-slate-50 disabled:text-slate-500"
                                                />
                                            </div>
                                        </div>

                                        {/* Right: Results */}
                                        <div>
                                            {result ? (
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-center">
                                                            <p className="text-[10px] font-bold text-blue-600 uppercase">Count</p>
                                                            <p className="text-xl font-bold">{result.cell_count}</p>
                                                        </div>
                                                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-center">
                                                            <p className="text-[10px] font-bold text-purple-600 uppercase">Confluence</p>
                                                            <p className="text-xl font-bold">{result.confluence}%</p>
                                                        </div>
                                                        <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 text-center">
                                                            <p className="text-[10px] font-bold text-orange-600 uppercase">Avg Size</p>
                                                            <p className="text-xl font-bold">{result.avg_size}</p>
                                                        </div>
                                                    </div>
                                                    {/* Size Distribution Bar */}
                                                    <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                                                        <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Size Distribution</p>
                                                        <div className="w-full h-3 bg-white rounded-full flex overflow-hidden border">
                                                            <div style={{ width: `${(distribution.Small / total) * 100}%` }} className="bg-amber-500 h-full"></div>
                                                            <div style={{ width: `${(distribution.Medium / total) * 100}%` }} className="bg-blue-600 h-full"></div>
                                                            <div style={{ width: `${(distribution.Large / total) * 100}%` }} className="bg-green-600 h-full"></div>
                                                        </div>
                                                        <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                                                            <span>S:{distribution.Small}</span>
                                                            <span>M:{distribution.Medium}</span>
                                                            <span>L:{distribution.Large}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-full flex items-center justify-center text-slate-300">
                                                    <p>ไม่มีผลการวิเคราะห์</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-4 pt-4 border-t flex justify-end gap-3">
                                        {isEditing ? (
                                            <>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="flex items-center gap-2 px-5 py-2 rounded-lg font-bold border border-slate-200 text-slate-600 hover:bg-slate-50"
                                                >
                                                    ยกเลิก
                                                </button>
                                                <button
                                                    onClick={() => saveEdit(project)}
                                                    disabled={savingId === project.id}
                                                    className="flex items-center gap-2 px-5 py-2 rounded-lg font-bold bg-green-600 text-white hover:bg-green-700 shadow-md"
                                                >
                                                    {savingId === project.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Save className="w-4 h-4" />
                                                    )}
                                                    {savingId === project.id ? "กำลังบันทึก..." : "บันทึก"}
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => startEdit(project)}
                                                className="flex items-center gap-2 px-5 py-2 rounded-lg font-bold border border-blue-200 text-blue-600 hover:bg-blue-50"
                                            >
                                                <Edit2 className="w-4 h-4" /> แก้ไขข้อมูล
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}