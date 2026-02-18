"use client";

import { useState, useRef, useMemo } from "react";
import {
    UploadCloud,
    Loader2,
    FileText,
    Layers,
    Image as ImageIcon,
    Printer,
    Download,
    ZoomIn,
    Eye,
    Maximize,
    X,
    Save,
    Edit2,
    Trash2,
    BarChart3,
    PieChart,
    CheckCircle2,
    AlertCircle,
    RotateCcw,
    Search
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    ZAxis,
    Legend
} from 'recharts';

// ==========================================
// 1. HELPER FUNCTIONS & CONSTANTS
// ==========================================

const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const getSizeColor = (size: string) => {
    switch (size) {
        case 'Small': return '#EAB308'; // Yellow-500
        case 'Medium': return '#2563EB'; // Blue-600
        case 'Large': return '#00FF00'; // Neon Green
        default: return '#EAB308';
    }
};

// ==========================================
// 2. SUB-COMPONENTS (FULL IMPLEMENTATION)
// ==========================================

// --- A. Summary Charts (กราฟสรุปผลท้ายหน้า Batch) ---
const SummaryCharts = ({ batchFiles }: { batchFiles: any[] }) => {
    // กรองเอาเฉพาะไฟล์ที่มีผลลัพธ์ (Result) แล้วเท่านั้น
    const processedFiles = batchFiles.filter(f => f.result);

    // ถ้ายังไม่มีผลลัพธ์ ไม่ต้องโชว์กราฟ
    if (processedFiles.length === 0) return null;

    // เตรียมข้อมูล Bar Chart (Group by Concentration)
    const barData = useMemo(() => {
        const groups: Record<string, number[]> = {};
        processedFiles.forEach(f => {
            const conc = f.conc ? f.conc.trim() : "Unknown";
            if (!groups[conc]) groups[conc] = [];
            groups[conc].push(f.result.cell_count);
        });

        return Object.keys(groups).map(conc => {
            const counts = groups[conc];
            const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
            return {
                name: conc,
                avgCount: Math.round(avg),
                count: counts.length
            };
        }).sort((a, b) => parseFloat(a.name) - parseFloat(b.name));
    }, [processedFiles]);

    // เตรียมข้อมูล Scatter Plot (จุดทุกจุดคือ 1 เซลล์)
    const scatterData = useMemo(() => {
        const data: any[] = [];
        processedFiles.forEach(f => {
            const conc = f.conc ? f.conc.trim() : "Unknown";
            if (f.result && f.result.detections) {
                f.result.detections.forEach((d: any) => {
                    data.push({
                        conc: conc,
                        size: d.area,
                        sizeClass: d.size
                    });
                });
            }
        });
        // เรียงตามความเข้มข้นเพื่อให้แกน X สวยงาม
        return data.sort((a, b) => parseFloat(a.conc) - parseFloat(b.conc));
    }, [processedFiles]);

    return (
        <div className="space-y-8 mt-12 pt-8 border-t-2 border-slate-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
                    <BarChart3 className="w-8 h-8 text-slate-700" />
                    ผลสรุปภาพรวม (Batch Summary)
                </h2>
                <p className="text-slate-500">วิเคราะห์แนวโน้มจากข้อมูลทั้งหมด {processedFiles.length} รูป</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Graph 1: Bar Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            <BarChart3 className="w-5 h-5" />
                        </span>
                        Effect on Colony Number
                    </h3>
                    <p className="text-xs text-slate-500 mb-6">ค่าเฉลี่ยจำนวนโคโลนี (Mean Colony Count) ต่อความเข้มข้น</p>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" label={{ value: 'Concentration (µM)', position: 'insideBottom', offset: -10, fontSize: 12 }} />
                                <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="avgCount" fill="#3B82F6" name="Mean Count" radius={[6, 6, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Graph 2: Scatter Plot */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                            <PieChart className="w-5 h-5" />
                        </span>
                        Colony Size Distribution
                    </h3>
                    <p className="text-xs text-slate-500 mb-6">การกระจายตัวของขนาดเซลล์ (Colony Size) ในแต่ละความเข้มข้น</p>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="category" dataKey="conc" name="Concentration" allowDuplicatedCategory={false} label={{ value: 'Concentration (µM)', position: 'insideBottom', offset: -10, fontSize: 12 }} />
                                <YAxis type="number" dataKey="size" name="Size" unit=" px²" label={{ value: 'Size (px²)', angle: -90, position: 'insideLeft', fontSize: 12 }} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Scatter name="Colonies" data={scatterData} fill="#DC2626" fillOpacity={0.5} line={false} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- B. Static Visualizer (สำหรับ PDF Print) ---
const StaticVisualizer = ({ result, filter = "All", title, showBoxes = true }: any) => {
    if (!result) return null;

    const image = result.original_image;
    const imgSrc = image?.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;
    const detections = result.detections || [];

    // Filter logic
    const visibleBoxes = showBoxes ? detections.filter((d: any) => filter === "All" || d.size === filter) : [];

    // ✅ ใช้ขนาดจริงจาก Backend เพื่อความแม่นยำ 100%
    const viewW = result.width || 1000;
    const viewH = result.height || 1000;

    // คำนวณความหนาเส้นตามขนาดรูป (Dynamic Stroke)
    const strokeW = Math.max(2, viewW / 250);

    return (
        <div className="break-inside-avoid mb-4 border border-slate-300 rounded-lg p-2 bg-white shadow-sm">
            <p className="text-xs font-bold text-slate-800 mb-2 uppercase text-center border-b pb-2">
                {title} {showBoxes && `(n=${visibleBoxes.length})`}
            </p>
            <div className="relative w-full bg-gray-50 flex justify-center">
                <img src={imgSrc} className="w-full h-auto object-contain" />

                {/* SVG Overlay ที่แม่นยำ */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${viewW} ${viewH}`}>
                    {visibleBoxes.map((box: any, idx: number) => (
                        <g key={idx}>
                            <rect
                                x={box.x} y={box.y} width={box.w} height={box.h}
                                fill="none"
                                stroke={getSizeColor(box.size)}
                                strokeWidth={strokeW}
                            />
                            <line
                                x1={box.x} y1={box.y}
                                x2={box.x + box.w} y2={box.y + box.h}
                                stroke="red"
                                strokeWidth={strokeW * 0.8}
                            />
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
};

// --- C. Visual Inspector (ซูมดูรูป Interactive) ---
const VisualInspector = ({ image, detections, onClose, width = 1000, height = 1000 }: any) => {
    const [filter, setFilter] = useState("All");
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const startPos = useRef({ x: 0, y: 0 });

    const visibleBoxes = detections ? detections.filter((d: any) => filter === "All" || d.size === filter) : [];

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        startPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    };
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({ x: e.clientX - startPos.current.x, y: e.clientY - startPos.current.y });
    };
    const handleMouseUp = () => setIsDragging(false);

    const imgSrc = image?.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;

    return (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col p-4 animate-in fade-in print:hidden">
            {/* Header */}
            <div className="flex justify-between items-center text-white mb-4 z-10">
                <h3 className="text-xl font-bold flex gap-2 items-center"><ZoomIn /> Visual Inspection Mode</h3>
                <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><X /></button>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4 justify-center mb-4 z-10">
                {['All', 'Small', 'Medium', 'Large'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full font-bold border transition-all text-sm ${filter === f ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}>{f}</button>
                ))}
                <div className="w-px bg-white/20 mx-2"></div>
                <button onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.5))} className="px-3 py-2 bg-slate-800 border border-white/20 text-white rounded">-</button>
                <span className="px-3 py-2 text-white font-bold w-16 text-center">{Math.round(zoomLevel * 100)}%</span>
                <button onClick={() => setZoomLevel(z => Math.min(5, z + 0.5))} className="px-3 py-2 bg-slate-800 border border-white/20 text-white rounded">+</button>
            </div>

            {/* Image Viewer */}
            <div className="flex-1 overflow-hidden flex justify-center items-center bg-zinc-900 rounded-xl border border-white/10 relative cursor-grab active:cursor-grabbing select-none"
                onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                <div style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`, transition: isDragging ? 'none' : 'transform 0.2s', transformOrigin: 'center' }} className="relative">
                    <img src={imgSrc} className="max-w-none shadow-2xl pointer-events-none" draggable={false} />
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                        {visibleBoxes.map((box: any, idx: number) => (
                            <g key={idx}>
                                <rect
                                    x={box.x} y={box.y} width={box.w} height={box.h}
                                    fill="none"
                                    stroke={getSizeColor(box.size)}
                                    strokeWidth={2 / zoomLevel}
                                />
                                <line
                                    x1={box.x} y1={box.y}
                                    x2={box.x + box.w} y2={box.y + box.h}
                                    stroke="red"
                                    strokeWidth={1.5 / zoomLevel}
                                />
                            </g>
                        ))}
                    </svg>
                </div>
            </div>
        </div>
    );
};

// --- D. Result Section (ส่วนแสดงตัวเลขและกราฟแท่ง) ---
const ResultSection = ({ data, preview, onInspect }: any) => {
    if (!data) return (
        <div className="p-8 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 min-h-[300px] flex flex-col items-center justify-center">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>รอการประมวลผล (Pending Analysis)</p>
        </div>
    );

    const originalSrc = data.original_image ? (data.original_image.startsWith('data:') ? data.original_image : `data:image/jpeg;base64,${data.original_image}`) : preview;

    // คำนวณ % สำหรับกราฟแท่งแนวนอน
    const { Small = 0, Medium = 0, Large = 0 } = data.size_distribution || {};
    const total = (Small + Medium + Large) || 1;

    return (
        <div className="space-y-4 animate-in fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2">
                <div className="p-2 bg-blue-50 rounded border border-blue-100 text-center flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-blue-600 uppercase">Count</p><p className="text-lg font-bold text-slate-800 leading-tight">{data.cell_count}</p>
                </div>
                <div className="p-2 bg-purple-50 rounded border border-purple-100 text-center flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-purple-600 uppercase">Confluence</p><p className="text-lg font-bold text-slate-800 leading-tight">{data.confluence}%</p>
                </div>
                <div className="p-2 bg-orange-50 rounded border border-orange-100 text-center flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-orange-600 uppercase">Avg Size</p><p className="text-lg font-bold text-slate-800 leading-tight">{data.avg_size}</p>
                </div>
                <div className="p-2 bg-green-50 rounded border border-green-100 flex flex-col justify-between">
                    <div className="flex justify-between items-end mb-1"><p className="text-[10px] font-bold text-green-600 uppercase">Size Dist.</p></div>
                    <div className="w-full h-3 bg-white rounded-full flex overflow-hidden border border-green-200 shadow-inner">
                        <div style={{ width: `${(Small / total) * 100}%` }} className="bg-amber-500 h-full"></div>
                        <div style={{ width: `${(Medium / total) * 100}%` }} className="bg-blue-600 h-full"></div>
                        <div style={{ width: `${(Large / total) * 100}%` }} className="bg-green-600 h-full"></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-600 mt-1 px-0.5">
                        <div className="flex items-center gap-0.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div>S:{Small}</div>
                        <div className="flex items-center gap-0.5"><div className="w-2 h-2 rounded-full bg-blue-600"></div>M:{Medium}</div>
                        <div className="flex items-center gap-0.5"><div className="w-2 h-2 rounded-full bg-green-600"></div>L:{Large}</div>
                    </div>
                </div>
            </div>

            {/* Visual Preview */}
            <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Eye className="w-4 h-4" /> Visual Inspection</h4>
                    <button onClick={onInspect} className="text-[10px] bg-slate-800 text-white px-2 py-1 rounded hover:bg-black flex items-center gap-1"><Maximize className="w-3 h-3" /> Full Zoom</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded border bg-black/5 aspect-video flex items-center justify-center overflow-hidden">
                        <img src={originalSrc} className="h-full object-contain" />
                    </div>
                    <div className="rounded border-2 border-blue-500 bg-black/5 aspect-video flex items-center justify-center overflow-hidden cursor-pointer relative" onClick={onInspect}>
                        <img src={originalSrc} className="h-full object-contain absolute inset-0 m-auto" />
                        {/* Overlay เล็กๆ เพื่อพรีวิว */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${data.width || 100} ${data.height || 100}`} preserveAspectRatio="xMidYMid meet">
                            {data.detections && data.detections.map((box: any, idx: number) => (
                                <g key={idx}>
                                    <rect x={box.x} y={box.y} width={box.w} height={box.h} fill="none" stroke={getSizeColor(box.size)} strokeWidth={(data.width || 1000) / 200} />
                                    <line x1={box.x} y1={box.y} x2={box.x + box.w} y2={box.y + box.h} stroke="red" strokeWidth={(data.width || 1000) / 300} />
                                </g>
                            ))}
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- E. Analysis Form (ฟอร์มกรอกข้อมูล) ---
const AnalysisForm = ({ form, setForm, disabled, title = "1. ข้อมูลการทดลอง" }: any) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">ชื่อโปรเจกต์ (Project Name)</label>
                    <input disabled={disabled} className="w-full p-2.5 border rounded-lg text-sm bg-white disabled:bg-slate-50 disabled:text-slate-500 transition-colors" placeholder="ex. Test Drug A Run 1"
                        value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">ชื่อยา (Drug Name)</label>
                    <input disabled={disabled} className="w-full p-2.5 border rounded-lg text-sm bg-white disabled:bg-slate-50 disabled:text-slate-500 transition-colors" placeholder="ex. Cisplatin"
                        value={form.drug} onChange={e => setForm({ ...form, drug: e.target.value })} />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">ความเข้มข้น (Conc.)</label>
                    <input disabled={disabled} className="w-full p-2.5 border rounded-lg text-sm bg-white disabled:bg-slate-50 disabled:text-slate-500 transition-colors" placeholder="ex. 10 uM"
                        value={form.conc} onChange={e => setForm({ ...form, conc: e.target.value })} />
                </div>
                <div className="col-span-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">รายละเอียดเพิ่มเติม (Description)</label>
                    <textarea disabled={disabled} className="w-full p-2.5 border rounded-lg text-sm bg-white disabled:bg-slate-50 disabled:text-slate-500 transition-colors" rows={2} placeholder="บันทึกสภาพแวดล้อม..."
                        value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 3. MAIN PAGE COMPONENT
// ==========================================

export default function NewProjectPage() {
    const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
    const [isProcessing, setIsProcessing] = useState(false);
    const [inspectorOpen, setInspectorOpen] = useState(false);
    const [currentInspectorImg, setCurrentInspectorImg] = useState<string | null>(null);
    const [currentInspectorDetections, setCurrentInspectorDetections] = useState<any[]>([]);
    const [currentImgSize, setCurrentImgSize] = useState({ w: 1000, h: 1000 });

    // Single Mode State
    const [singleFile, setSingleFile] = useState<File | null>(null);
    const [singlePreview, setSinglePreview] = useState<string | null>(null);
    const [singleData, setSingleData] = useState<any>(null);
    const [singleForm, setSingleForm] = useState({ name: "", drug: "", conc: "", desc: "" });
    const [isSingleEditing, setIsSingleEditing] = useState(true); // Default = Edit Enabled
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Function: Save project to database
    const saveSingleProject = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: singleForm.name || "Untitled Project",
                    drugName: singleForm.drug || null,
                    concentration: singleForm.conc || null,
                    description: singleForm.desc || null,
                    result: singleData ? JSON.stringify(singleData) : null,
                }),
            });
            if (res.ok) {
                setSaveSuccess(true);
                setIsSingleEditing(false);
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                alert("บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง");
            }
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการบันทึก");
        } finally {
            setIsSaving(false);
        }
    };

    // Batch Mode State
    const [batchDefaults, setBatchDefaults] = useState({ name: "", drug: "", conc: "", desc: "" });
    const [batchFiles, setBatchFiles] = useState<any[]>([]);

    // Function: Toggle Batch Item Edit
    const toggleBatchEdit = (id: string, isEditing: boolean) => {
        setBatchFiles(batchFiles.map(f => f.id === id ? { ...f, editMode: isEditing } : f));
    };

    // Function: Handle File Upload
    const handleFileChange = (e: any, mode: 'single' | 'batch') => {
        if (e.target.files && e.target.files[0]) {
            if (mode === 'single') {
                const file = e.target.files[0];
                setSingleFile(file);
                setSinglePreview(URL.createObjectURL(file));
                setSingleData(null);
                setIsSingleEditing(true); // Reset to edit mode
            } else {
                const newFiles = Array.from(e.target.files).map((f: any) => ({
                    id: Math.random().toString(),
                    file: f,
                    preview: URL.createObjectURL(f),
                    // ✅ 1. Copy Default Values to each new file (Editable later)
                    name: batchDefaults.name,
                    drug: batchDefaults.drug,
                    conc: batchDefaults.conc,
                    desc: batchDefaults.desc,
                    result: null,
                    editMode: false // Start locked (wait for process)
                }));
                setBatchFiles([...batchFiles, ...newFiles]);
            }
        }
    };

    // Function: Remove Batch File
    const removeBatchFile = (id: string) => { setBatchFiles(batchFiles.filter(f => f.id !== id)); };

    // Function: API Call
    const processImage = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/analyze", { method: "POST", body: formData });
        return await res.json();
    };

    // Function: Process Single
    // ✅ แก้ไข: หลังประมวลผล ให้ isSingleEditing = true (เพื่อให้ปุ่ม Save เขียว กดได้)
    const handleSingleProcess = async () => {
        if (!singleFile) return;
        setIsProcessing(true);
        try {
            const data = await processImage(singleFile);
            setSingleData(data);
            setIsSingleEditing(true); // ✅ เปิดโหมดแก้ไข -> ปุ่ม Save Active
        } catch (e) { alert("Error: Can't connect to AI Server"); }
        setIsProcessing(false);
    };

    // Function: Process Batch
    const handleBatchProcess = async () => {
        setIsProcessing(true);
        const updatedFiles = [...batchFiles];
        for (let i = 0; i < updatedFiles.length; i++) {
            if (!updatedFiles[i].result) {
                try {
                    const data = await processImage(updatedFiles[i].file);
                    updatedFiles[i].result = data;
                    updatedFiles[i].editMode = true; // ✅ เปิดโหมดแก้ไข -> ปุ่ม Save Active
                    setBatchFiles([...updatedFiles]);
                } catch (e) { }
            }
        }
        setIsProcessing(false);
    };

    const handlePrint = () => { window.print(); };

    const handleExportCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,Image Name,Drug,Concentration,Colony ID,Size Category,Area (pixels),Width,Height\n";
        const appendRows = (imgName: string, drug: string, conc: string, result: any) => {
            if (!result || !result.detections) return;
            result.detections.forEach((d: any, index: number) => {
                csvContent += `${imgName},${drug},${conc},${index + 1},${d.size},${d.area},${d.w.toFixed(2)},${d.h.toFixed(2)}\n`;
            });
        };
        if (activeTab === 'single' && singleData) {
            appendRows(singleFile?.name || "image", singleForm.drug, singleForm.conc, singleData);
        } else if (activeTab === 'batch') {
            batchFiles.forEach(f => {
                appendRows(f.file.name, f.drug, f.conc, f.result);
            });
        } else { alert("ไม่มีข้อมูลสำหรับ Export"); return; }
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "colony_raw_data.csv");
        document.body.appendChild(link);
        link.click();
    };

    const LoadingModal = () => (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in">
            <div className="bg-white p-10 rounded-3xl shadow-2xl flex flex-col items-center animate-bounce-slow">
                <Loader2 className="w-20 h-20 text-blue-600 animate-spin mb-6" />
                <h3 className="text-2xl font-bold text-slate-800">กำลังประมวลผล...</h3>
                <p className="text-slate-500 mt-2">กำลังส่งข้อมูลไปยัง Python AI Model</p>
            </div>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            {/* 🟢 PRINT REPORT SECTION (Hidden on screen) */}
            <div className="hidden print:block space-y-8 p-0">
                <div className="text-center border-b-2 border-black pb-4 mb-4">
                    <h1 className="text-2xl font-bold uppercase">Laboratory Analysis Report</h1>
                    <p className="text-sm text-gray-500">Automated Cancer Colony Counting System</p>
                    <p className="text-xs text-gray-400 mt-1">Generated on {new Date().toLocaleDateString()}</p>
                </div>

                {(activeTab === 'single' ? [{ result: singleData, form: singleForm, file: singleFile }] : batchFiles).map((item: any, idx) => (
                    item.result && (
                        <div key={idx} className="break-before-page flex flex-col min-h-screen">
                            <div className="mb-4">
                                <div className="flex justify-between items-start bg-slate-50 p-4 border rounded-lg">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">Project: {item.form?.name || item.name || "Untitled"}</h2>
                                        <p className="text-sm text-slate-600 mt-1">File Name: <b>{item.file?.name}</b></p>
                                    </div>
                                    <div className="text-right text-sm">
                                        <p><b>Drug:</b> {item.form?.drug || item.drug || "-"}</p>
                                        <p><b>Conc:</b> {item.form?.conc || item.conc || "-"}</p>
                                    </div>
                                </div>
                                <div className="mt-2 p-3 border rounded-lg flex justify-between text-center bg-white text-xs">
                                    <div><p className="text-slate-400">Total Count</p><p className="font-bold text-lg">{item.result.cell_count}</p></div>
                                    <div><p className="text-slate-400">Confluence</p><p className="font-bold text-lg">{item.result.confluence}%</p></div>
                                    <div><p className="text-slate-400">Avg Size</p><p className="font-bold text-lg">{item.result.avg_size}</p></div>
                                    <div><p className="text-slate-400">S/M/L</p><p className="font-bold text-lg">{item.result.size_distribution.Small}/{item.result.size_distribution.Medium}/{item.result.size_distribution.Large}</p></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-2">
                                <StaticVisualizer result={item.result} title="1. Original (Raw)" showBoxes={false} />
                                <StaticVisualizer result={item.result} title="2. All Detections" filter="All" />
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <StaticVisualizer result={item.result} title="3. Small Only" filter="Small" />
                                <StaticVisualizer result={item.result} title="4. Medium Only" filter="Medium" />
                                <StaticVisualizer result={item.result} title="5. Large Only" filter="Large" />
                            </div>

                            <div className="mt-2">
                                <h3 className="text-xs font-bold uppercase text-slate-700 mb-2 border-b border-black pb-1">Raw Colony Data (First 50 items)</h3>
                                <table className="w-full text-[10px] text-left border-collapse border border-slate-300">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            <th className="border p-1">ID</th>
                                            <th className="border p-1">Size Class</th>
                                            <th className="border p-1">Area (px)</th>
                                            <th className="border p-1">W</th>
                                            <th className="border p-1">H</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {item.result.detections.slice(0, 50).map((d: any, i: number) => (
                                            <tr key={i}>
                                                <td className="border p-1">{i + 1}</td>
                                                <td className="border p-1">{d.size}</td>
                                                <td className="border p-1">{d.area}</td>
                                                <td className="border p-1">{d.w.toFixed(1)}</td>
                                                <td className="border p-1">{d.h.toFixed(1)}</td>
                                            </tr>
                                        ))}
                                        {item.result.detections.length > 50 && (
                                            <tr><td colSpan={5} className="border p-2 text-center italic text-slate-500">... see CSV for full list ({item.result.detections.length} items) ...</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                ))}
            </div>

            {/* 🔴 MAIN DASHBOARD */}
            <div className="print:hidden">
                {isProcessing && <LoadingModal />}
                {inspectorOpen && (
                    <VisualInspector
                        image={currentInspectorImg}
                        detections={currentInspectorDetections}
                        onClose={() => setInspectorOpen(false)}
                        width={currentImgSize.w}
                        height={currentImgSize.h}
                    />
                )}

                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl shadow-lg transition-colors ${activeTab === 'single' ? 'bg-blue-600 shadow-blue-200' : 'bg-purple-600 shadow-purple-200'}`}>
                            {activeTab === 'single' ? <FileText className="w-8 h-8 text-white" /> : <Layers className="w-8 h-8 text-white" />}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">{activeTab === 'single' ? 'Single Analysis' : 'Batch Analysis'}</h1>
                            <p className="text-slate-500 text-sm">วิเคราะห์ความเข้มข้นของยาและนับจำนวนเซลล์</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-slate-900"><Printer className="w-4 h-4" /> Print Report</button>
                        <button onClick={handleExportCSV} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-green-700"><Download className="w-4 h-4" /> CSV</button>
                        <div className="w-px bg-slate-200 mx-2"></div>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button onClick={() => setActiveTab('single')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'single' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Single</button>
                            <button onClick={() => setActiveTab('batch')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'batch' ? 'bg-white shadow text-purple-600' : 'text-slate-500'}`}>Batch</button>
                        </div>
                    </div>
                </div>

                {activeTab === 'single' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                                <div className="flex justify-between border-b pb-2 mb-2">
                                    <h2 className="font-bold text-slate-700">1. ข้อมูลการทดลอง</h2>
                                </div>
                                {/* ✅ Form Disabled ตามสถานะ isSingleEditing */}
                                <AnalysisForm form={singleForm} setForm={setSingleForm} disabled={!isSingleEditing} />
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <h2 className="font-bold text-slate-700 border-b pb-2 mb-4">2. อัปโหลดรูปภาพ</h2>
                                {singleFile ? (
                                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="p-3 bg-white rounded-lg border shadow-sm flex-shrink-0"><FileText className="w-6 h-6 text-blue-600" /></div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-700 truncate">{singleFile.name}</p>
                                                <p className="text-xs text-slate-500">{formatBytes(singleFile.size)}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => { setSingleFile(null); setSinglePreview(null); setSingleData(null) }} className="text-slate-400 hover:text-red-500 p-2 ml-2 flex-shrink-0"><X className="w-5 h-5" /></button>
                                    </div>
                                ) : (
                                    <label className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                                        <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'single')} />
                                        <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                                        <span className="text-sm font-medium text-slate-600">คลิกเพื่อเลือกรูปภาพ</span>
                                    </label>
                                )}
                                <button onClick={handleSingleProcess} disabled={!singleFile} className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300 transition-all flex justify-center gap-2">
                                    {isProcessing ? <Loader2 className="animate-spin" /> : "เริ่มประมวลผล (Start Analysis)"}
                                </button>
                            </div>
                        </div>
                        <div className="lg:col-span-8">
                            {singleData ? (
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mt-4 animate-in slide-in-from-bottom-2">
                                    <h3 className="text-md font-bold text-slate-800 border-b pb-3 mb-4">ผลการวิเคราะห์</h3>
                                    <ResultSection
                                        data={singleData}
                                        preview={singlePreview}
                                        onInspect={() => {
                                            setCurrentInspectorImg(singleData.original_image);
                                            setCurrentInspectorDetections(singleData.detections);
                                            setCurrentImgSize({ w: singleData.width, h: singleData.height });
                                            setInspectorOpen(true);
                                        }}
                                    />
                                    {/* ✅ ปุ่ม Edit/Save ของ Single Mode (แยกปุ่ม) */}
                                    <div className="mt-6 pt-4 border-t flex justify-end gap-3">
                                        <button
                                            onClick={() => setIsSingleEditing(true)}
                                            disabled={isSingleEditing}
                                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold border transition-all ${isSingleEditing ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                                        >
                                            <Edit2 className="w-4 h-4" /> แก้ไขข้อมูล
                                        </button>
                                        <button
                                            onClick={saveSingleProject}
                                            disabled={!isSingleEditing || isSaving}
                                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${(!isSingleEditing || isSaving) ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 shadow-md'}`}
                                        >
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            {isSaving ? "กำลังบันทึก..." : saveSuccess ? "✅ บันทึกแล้ว!" : "บันทึกข้อมูล"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-300 bg-slate-50/50">
                                    <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                                    <p>ผลลัพธ์การวิเคราะห์จะแสดงที่นี่</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'batch' && (
                    <div className="space-y-8 mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left Panel */}
                            <div className="lg:col-span-4 space-y-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                                    <p className="text-xs text-purple-600 bg-purple-50 p-2 rounded border border-purple-100 mb-2">
                                        💡 ข้อมูลที่กรอกตรงนี้จะเป็น <b>ค่าเริ่มต้น (Default)</b> ให้กับทุกรูป
                                    </p>
                                    <AnalysisForm form={batchDefaults} setForm={setBatchDefaults} disabled={false} title="1. ข้อมูลหลัก (ใช้ร่วมกัน)" />
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                    <h2 className="font-bold text-slate-700 border-b pb-2 mb-4">2. อัปโหลดรูปภาพ (Batch)</h2>
                                    <label className="border-2 border-dashed border-purple-300 bg-purple-50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-100 transition-colors">
                                        <input type="file" multiple className="hidden" onChange={(e) => handleFileChange(e, 'batch')} />
                                        <Layers className="w-10 h-10 text-purple-500 mb-2" />
                                        <span className="text-sm font-medium text-purple-700">คลิกเพื่อเพิ่มรูปภาพ (Multiple)</span>
                                    </label>

                                    {batchFiles.length > 0 && (
                                        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                            {batchFiles.map((f, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm">
                                                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center border shadow-sm text-purple-500 font-bold text-xs">{i + 1}</div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-bold text-slate-700 truncate">{f.file.name}</div>
                                                        <div className="text-xs text-slate-400">{formatBytes(f.file.size)}</div>
                                                    </div>
                                                    <button onClick={() => removeBatchFile(f.id)} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {batchFiles.length > 0 && (
                                        <button onClick={handleBatchProcess} disabled={isProcessing} className="mt-4 w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 flex justify-center gap-2">
                                            {isProcessing ? <Loader2 className="animate-spin" /> : `ประมวลผลทั้งหมด (${batchFiles.length})`}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Right Panel: Result Cards */}
                            <div className="lg:col-span-8 space-y-6">
                                {batchFiles.length === 0 ? (
                                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-300 bg-slate-50/50">
                                        <Layers className="w-16 h-16 mb-4 opacity-20" />
                                        <p>ยังไม่มีรูปภาพที่อัปโหลด</p>
                                    </div>
                                ) : (
                                    batchFiles.map((item, idx) => (
                                        <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                                            {/* ✅ Header */}
                                            <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
                                                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                                    <span className="bg-slate-200 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">{idx + 1}</span>
                                                    {item.file.name}
                                                </h3>
                                                <button onClick={() => removeBatchFile(item.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-4 h-4" /></button>
                                            </div>

                                            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                                                <div className="lg:col-span-5 space-y-4 border-r lg:pr-6">

                                                    {/* ✅ แทนที่รูปด้วยกล่องแสดงชื่อไฟล์ */}
                                                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4">
                                                        <div className="p-2 bg-white rounded-lg border shadow-sm">
                                                            <ImageIcon className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs text-slate-500 font-medium">File Name</p>
                                                            <p className="text-sm font-bold text-slate-800 truncate" title={item.file.name}>{item.file.name}</p>
                                                        </div>
                                                    </div>

                                                    <AnalysisForm
                                                        form={item}
                                                        setForm={(newForm: any) => {
                                                            const newFiles = [...batchFiles];
                                                            newFiles[idx] = { ...newFiles[idx], ...newForm };
                                                            setBatchFiles(newFiles);
                                                        }}
                                                        disabled={item.result && !item.editMode}
                                                        title="แก้ไขข้อมูลเฉพาะรูปนี้"
                                                    />
                                                </div>
                                                <div className="lg:col-span-7">
                                                    <ResultSection
                                                        data={item.result}
                                                        preview={item.preview}
                                                        onInspect={() => {
                                                            setCurrentInspectorImg(item.result.original_image);
                                                            setCurrentInspectorDetections(item.result.detections);
                                                            setCurrentImgSize({ w: item.result.width, h: item.result.height });
                                                            setInspectorOpen(true);
                                                        }}
                                                    />
                                                    {/* ✅ ปุ่ม Edit/Save ของ Batch Mode (แยกปุ่ม) */}
                                                    {item.result && (
                                                        <div className="mt-4 pt-3 border-t flex justify-end gap-2">
                                                            <button
                                                                onClick={() => toggleBatchEdit(item.id, true)}
                                                                disabled={item.editMode}
                                                                className={`flex items-center gap-1 px-4 py-2 border rounded font-bold text-sm ${item.editMode ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                                                            >
                                                                <Edit2 className="w-4 h-4" /> แก้ไข
                                                            </button>
                                                            <button
                                                                onClick={() => toggleBatchEdit(item.id, false)}
                                                                disabled={!item.editMode}
                                                                className={`flex items-center gap-1 px-4 py-2 rounded font-bold text-sm ${!item.editMode ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 shadow-sm'}`}
                                                            >
                                                                <Save className="w-4 h-4" /> บันทึก
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* ✅ Summary Charts */}
                        <SummaryCharts batchFiles={batchFiles} />
                    </div>
                )}
            </div>
        </div>
    );
}