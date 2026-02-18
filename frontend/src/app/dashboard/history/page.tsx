"use client";

import { useState, useRef } from "react";
import { 
  FileText, Calendar, Search, Save, Edit2, Trash2, Eye, Maximize, ZoomIn, X, ImageIcon, RotateCcw, Printer, Loader2, UploadCloud
} from "lucide-react";

// ==========================================
// 1. HELPER FUNCTIONS & MOCK GENERATOR
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
        case 'Small': return '#EAB308'; // Yellow
        case 'Medium': return '#2563EB'; // Blue
        case 'Large': return '#00FF00'; // Neon Green
        default: return '#EAB308';
    }
};

// ✅ ปรับปรุง Algorithm ให้กรอบเล็กและเยอะ สมจริงกับรูปเซลล์
const generateMockResult = (count: number, width: number, height: number, imagePath: string) => {
    const detections = [];
    let Small = 0, Medium = 0, Large = 0;
    let totalArea = 0;

    for (let i = 0; i < count; i++) {
        // สุ่มขนาดให้เล็ก (8px - 25px) เพื่อให้เข้ากับรูป mock0.jpg
        const w = Math.floor(Math.random() * 17 + 8); 
        const h = Math.floor(Math.random() * 17 + 8);
        
        // สุ่มตำแหน่ง (ต้องไม่เกินขอบเขตภาพ)
        const x = Math.floor(Math.random() * (width - w));
        const y = Math.floor(Math.random() * (height - h));
        
        const area = w * h;
        totalArea += area;

        // แบ่งเกณฑ์ขนาดใหม่ให้เข้ากับเซลล์เล็ก
        let size = 'Medium';
        if (area < 150) { size = 'Small'; Small++; }
        else if (area > 400) { size = 'Large'; Large++; }
        else { Medium++; }

        detections.push({ x, y, w, h, size, area });
    }

    return {
        cell_count: count,
        confluence: ((totalArea / (width * height)) * 100).toFixed(2),
        avg_size: Math.round(totalArea / count),
        size_distribution: { Small, Medium, Large },
        width, height,
        original_image: imagePath,
        detections: detections
    };
};

// ==========================================
// 2. SHARED COMPONENTS
// ==========================================

const StaticVisualizer = ({ result, filter = "All", title, showBoxes = true }: any) => {
    if (!result) return null;
    const image = result.original_image;
    const imgSrc = image?.startsWith('data:') ? image : image;
    const detections = result.detections || [];
    const visibleBoxes = showBoxes ? detections.filter((d: any) => filter === "All" || d.size === filter) : [];
    const viewW = result.width || 800;
    const viewH = result.height || 600;
    
    // เส้นบางลงเพื่อให้ดูละเอียด
    const strokeW = Math.max(1, viewW / 600); 

    return (
        <div className="break-inside-avoid mb-4 border border-slate-300 rounded-lg p-2 bg-white shadow-sm">
            <p className="text-xs font-bold text-slate-800 mb-2 uppercase text-center border-b pb-2">{title} {showBoxes && `(n=${visibleBoxes.length})`}</p>
            {/* ✅ เพิ่ม overflow-hidden ป้องกันกรอบล้น */}
            <div className="relative w-full bg-gray-50 flex justify-center overflow-hidden rounded">
                <img src={imgSrc} className="w-full h-auto object-cover" />
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${viewW} ${viewH}`}>
                    {visibleBoxes.map((box: any, idx: number) => (
                        <g key={idx}>
                            <rect x={box.x} y={box.y} width={box.w} height={box.h} fill="none" stroke={getSizeColor(box.size)} strokeWidth={strokeW} />
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
};

const VisualInspector = ({ image, detections, onClose, width = 1000, height = 1000 }: any) => {
  const [filter, setFilter] = useState("All");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const visibleBoxes = detections ? detections.filter((d: any) => filter === "All" || d.size === filter) : [];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  const imgSrc = image?.startsWith('data:') ? image : image;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col p-4 animate-in fade-in print:hidden">
        <div className="flex justify-between items-center text-white mb-4 z-10"><h3 className="text-xl font-bold flex gap-2 items-center"><ZoomIn/> Visual Inspection Mode</h3><button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><X/></button></div>
        <div className="flex gap-4 justify-center mb-4 z-10">{['All', 'Small', 'Medium', 'Large'].map(f => (<button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full font-bold border transition-all text-sm ${filter === f ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}>{f}</button>))}<div className="w-px bg-white/20 mx-2"></div><button onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.5))} className="px-3 py-2 bg-slate-800 border border-white/20 text-white rounded">-</button><span className="px-3 py-2 text-white font-bold w-16 text-center">{Math.round(zoomLevel * 100)}%</span><button onClick={() => setZoomLevel(z => Math.min(5, z + 0.5))} className="px-3 py-2 bg-slate-800 border border-white/20 text-white rounded">+</button></div>
        
        {/* ✅ เพิ่ม overflow-hidden และการจัดวางที่ถูกต้อง */}
        <div className="flex-1 overflow-hidden flex justify-center items-center bg-zinc-900 rounded-xl border border-white/10 relative cursor-grab active:cursor-grabbing select-none" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <div style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`, transition: isDragging ? 'none' : 'transform 0.2s', transformOrigin: 'center' }} className="relative">
                <img src={imgSrc} className="max-w-none shadow-2xl pointer-events-none" draggable={false} />
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                    {visibleBoxes.map((box: any, idx: number) => (
                        <g key={idx}>
                            <rect x={box.x} y={box.y} width={box.w} height={box.h} fill="none" stroke={getSizeColor(box.size)} strokeWidth={1 / zoomLevel} />
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    </div>
  );
};

const ResultSection = ({ data, preview, onInspect }: any) => {
    if (!data) return null;
    const { Small = 0, Medium = 0, Large = 0 } = data.size_distribution || {};
    const total = Small + Medium + Large || 1; 
    const displayImage = preview ? preview : data.original_image;

    return (
        <div className="space-y-4 animate-in fade-in">
             <div className="grid grid-cols-4 gap-2">
                 <div className="p-2 bg-blue-50 rounded border border-blue-100 text-center flex flex-col justify-center"><p className="text-[10px] font-bold text-blue-600">Count</p><p className="text-lg font-bold">{data.cell_count}</p></div>
                 <div className="p-2 bg-purple-50 rounded border border-purple-100 text-center"><p className="text-[10px] font-bold text-purple-600">Conf.</p><p className="text-lg font-bold">{data.confluence}%</p></div>
                 <div className="p-2 bg-orange-50 rounded border border-orange-100 text-center"><p className="text-[10px] font-bold text-orange-600">Avg Size</p><p className="text-lg font-bold">{data.avg_size}</p></div>
                 <div className="p-2 bg-green-50 rounded border border-green-100 flex flex-col justify-between"><div className="w-full h-3 bg-white rounded-full flex overflow-hidden border"><div style={{ width: `${(Small/total)*100}%` }} className="bg-amber-500 h-full"></div><div style={{ width: `${(Medium/total)*100}%` }} className="bg-blue-600 h-full"></div><div style={{ width: `${(Large/total)*100}%` }} className="bg-green-600 h-full"></div></div><div className="flex justify-between text-[10px] text-slate-600 mt-1"><span>S:{Small}</span><span>M:{Medium}</span><span>L:{Large}</span></div></div>
            </div>
            <div className="border-t pt-3">
                 <div className="flex justify-between items-center mb-2"><h4 className="text-sm font-bold text-slate-700 flex gap-2"><Eye className="w-4 h-4"/> Visual Inspection</h4><button onClick={onInspect} className="text-[10px] bg-slate-800 text-white px-2 py-1 rounded hover:bg-black gap-1 flex"><Maximize className="w-3 h-3"/> Zoom</button></div>
                 <div className="grid grid-cols-2 gap-3">
                    {/* ✅ เพิ่ม overflow-hidden ป้องกันล้นที่นี่ */}
                    <div className="rounded border bg-black/5 aspect-video flex items-center justify-center overflow-hidden"><img src={displayImage} className="h-full w-full object-cover"/></div>
                    
                    {/* ✅ เพิ่ม overflow-hidden ที่ container นี้ด้วย */}
                    <div className="rounded border-2 border-blue-500 bg-black/5 aspect-video flex items-center justify-center overflow-hidden relative cursor-pointer" onClick={onInspect}>
                        <img src={displayImage} className="h-full w-full object-cover absolute inset-0 m-auto" />
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${data.width || 800} ${data.height || 600}`} preserveAspectRatio="none">
                            {data.detections?.map((box: any, idx: number) => (
                                <g key={idx}>
                                    <rect x={box.x} y={box.y} width={box.w} height={box.h} fill="none" stroke={getSizeColor(box.size)} strokeWidth="1.5" />
                                </g>
                            ))}
                        </svg>
                    </div>
                 </div>
            </div>
        </div>
    );
};

const AnalysisForm = ({ form, setForm, disabled }: any) => (
    <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
            <div><label className="text-xs font-bold text-slate-500">ชื่อโปรเจกต์</label><input disabled={disabled} className="w-full p-2.5 border rounded-lg text-sm bg-white disabled:bg-slate-50 transition-colors" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
            <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-bold text-slate-500">ชื่อยา</label><input disabled={disabled} className="w-full p-2.5 border rounded-lg text-sm bg-white disabled:bg-slate-50 transition-colors" value={form.drug} onChange={e=>setForm({...form,drug:e.target.value})}/></div>
                <div><label className="text-xs font-bold text-slate-500">ความเข้มข้น</label><input disabled={disabled} className="w-full p-2.5 border rounded-lg text-sm bg-white disabled:bg-slate-50 transition-colors" value={form.conc} onChange={e=>setForm({...form,conc:e.target.value})}/></div>
            </div>
            <div><label className="text-xs font-bold text-slate-500">รายละเอียด</label><textarea disabled={disabled} className="w-full p-2.5 border rounded-lg text-sm bg-white disabled:bg-slate-50 transition-colors" rows={2} value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})}/></div>
        </div>
    </div>
);

// ==========================================
// 3. MAIN PAGE LOGIC (HISTORY)
// ==========================================

export default function HistoryPage() {
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [currentInspectorImg, setCurrentInspectorImg] = useState<string | null>(null);
  const [currentInspectorDetections, setCurrentInspectorDetections] = useState<any[]>([]);
  const [currentImgSize, setCurrentImgSize] = useState({ w: 1000, h: 1000 });
  const [isProcessing, setIsProcessing] = useState<string | null>(null); 

  // ✅ ใช้รูป mock0.jpg (รูปนี้มีขนาดประมาณ 800x600 ถ้าขนาดจริงต่างจากนี้กรอบอาจจะเคลื่อนนิดหน่อย แต่ใน mock ถือว่าโอเค)
  const LOCAL_MOCK_IMAGE = "/mock0.jpg"; 

  // ✅ สร้าง Mock Data ที่สมจริงด้วยฟังก์ชัน generateMockResult (300+ cells)
  const [historyItems, setHistoryItems] = useState([
    {
        id: "1", 
        date: "28/01/2026", 
        fileName: "Isal_30uM_A549_7d_N1_3.tiff", 
        form: { name: "Test Cisplatin Case 1", drug: "Cisplatin", conc: "10 uM", desc: "ทดสอบครั้งที่ 1" },
        // ✅ สร้าง 350 detection ให้ดูแน่นๆ (ขนาดภาพอิงตามรูปจริง)
        result: generateMockResult(350, 800, 600, LOCAL_MOCK_IMAGE),
        preview: LOCAL_MOCK_IMAGE, 
        editMode: false,
        newFile: null 
    },
    {
        id: "2", 
        date: "27/01/2026", 
        fileName: "Isal_30uM_A549_7d_N1_2.tiff", 
        form: { name: "Control Group B", drug: "None", conc: "-", desc: "กลุ่มควบคุม B" },
        // ✅ สร้าง 420 detection
        result: generateMockResult(420, 800, 600, LOCAL_MOCK_IMAGE),
        preview: LOCAL_MOCK_IMAGE, 
        editMode: false,
        newFile: null
    }
  ]);

  const toggleEdit = (id: string, isEditing: boolean) => {
    setHistoryItems(historyItems.map(item => item.id === id ? { ...item, editMode: isEditing } : item));
  };

  const updateForm = (id: string, newForm: any) => {
    setHistoryItems(historyItems.map(item => item.id === id ? { ...item, form: { ...item.form, ...newForm } } : item));
  };

  const deleteItem = (id: string) => {
    if(confirm("ยืนยันการลบประวัติ?")) setHistoryItems(historyItems.filter(item => item.id !== id));
  };

  const handleNewFile = (id: string, e: any) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const newPreview = URL.createObjectURL(file);
          setHistoryItems(historyItems.map(item => 
              item.id === id ? { 
                  ...item, 
                  newFile: file, 
                  preview: newPreview, 
                  fileName: file.name
              } : item
          ));
      }
  };

  const handleReAnalyze = (id: string) => {
      setIsProcessing(id);
      setTimeout(() => {
          setIsProcessing(null);
          setHistoryItems(prev => prev.map(item => {
              if (item.id === id) {
                  const currentImage = item.preview || item.result.original_image;
                  // สุ่มจำนวนใหม่ให้ดูเหมือนวิเคราะห์จริง
                  const newCount = Math.floor(Math.random() * 50) + 300; 
                  return {
                      ...item,
                      editMode: false,
                      result: generateMockResult(newCount, 800, 600, currentImage),
                      newFile: null
                  };
              }
              return item;
          }));
          alert(`ประมวลผลใหม่เสร็จสิ้น (Project ID: ${id})`);
      }, 2000);
  };

  const handlePrint = () => window.print();

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
        
        {/* Print Report */}
        <div className="hidden print:block space-y-8">
            <div className="text-center border-b-2 border-black pb-4 mb-4">
                <h1 className="text-2xl font-bold uppercase">Analysis History Report</h1>
                <p className="text-sm text-gray-500">Automated Cancer Colony Counting System</p>
            </div>
            {historyItems.map((item, idx) => (
                <div key={item.id} className="break-before-page flex flex-col min-h-screen">
                    <div className="mb-4 bg-slate-50 p-4 border rounded-lg flex justify-between">
                        <div>
                            <h2 className="text-lg font-bold">{item.form.name}</h2>
                            <p className="text-sm text-slate-500">Date: {item.date}</p>
                        </div>
                        <div className="text-right">
                            <p><b>Drug:</b> {item.form.drug}</p>
                            <p><b>Conc:</b> {item.form.conc}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                        <StaticVisualizer result={item.result} title="1. Original" showBoxes={false} />
                        <StaticVisualizer result={item.result} title="2. All Detections" filter="All" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <StaticVisualizer result={item.result} title="3. Small Only" filter="Small" />
                        <StaticVisualizer result={item.result} title="4. Medium Only" filter="Medium" />
                        <StaticVisualizer result={item.result} title="5. Large Only" filter="Large" />
                    </div>
                </div>
            ))}
        </div>

        {/* Dashboard */}
        <div className="print:hidden">
            {inspectorOpen && (
                <VisualInspector 
                    image={currentInspectorImg} 
                    detections={currentInspectorDetections} 
                    onClose={() => setInspectorOpen(false)}
                    width={currentImgSize.w}
                    height={currentImgSize.h}
                />
            )}

            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl shadow-lg bg-emerald-600 shadow-emerald-200"><Calendar className="w-8 h-8 text-white"/></div>
                    <div><h1 className="text-2xl font-bold text-slate-800">History</h1><p className="text-slate-500 text-sm">ประวัติการวิเคราะห์ทั้งหมด</p></div>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4"/>
                        <input placeholder="ค้นหา..." className="pl-10 pr-4 py-2 border rounded-full text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"/>
                    </div>
                    <button onClick={handlePrint} className="px-4 py-2 bg-slate-800 text-white rounded-lg flex gap-2 items-center"><Printer className="w-4 h-4"/> Print All</button>
                </div>
            </div>

            <div className="space-y-6 mt-6">
                {historyItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                        {/* Header */}
                        <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
                            <div className="flex gap-4 items-center">
                                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">{item.date}</span>
                                <h3 className="font-bold text-slate-700">{item.form.name}</h3>
                            </div>
                            <button onClick={() => deleteItem(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50" title="ลบประวัติ">
                                <Trash2 className="w-4 h-4"/>
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left Col: Form & Re-Analyze */}
                            <div className="lg:col-span-5 border-r lg:pr-6 space-y-4">
                                
                                {/* ✅ File Name Box + Change Image Button */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <div className="p-2 bg-white rounded-lg border shadow-sm">
                                            <ImageIcon className="w-5 h-5 text-blue-600"/>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs text-slate-500 font-medium">File Name</p>
                                            <p className="text-sm font-bold text-slate-800 truncate" title={item.fileName}>
                                                {item.fileName}
                                            </p>
                                        </div>
                                        {/* ✅ ปุ่ม Change Image (แสดงเฉพาะตอน Edit) */}
                                        {item.editMode && (
                                            <label className="cursor-pointer bg-white border border-blue-200 text-blue-600 text-xs font-bold px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-1">
                                                <UploadCloud className="w-3 h-3"/>
                                                Change
                                                <input type="file" className="hidden" onChange={(e) => handleNewFile(item.id, e)}/>
                                            </label>
                                        )}
                                    </div>
                                    
                                    {/* ✅ Preview รูปใหม่ */}
                                    {item.preview && item.editMode && item.newFile && (
                                        <div className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-black/5 flex items-center justify-center animate-in fade-in zoom-in-95">
                                            <img src={item.preview} className="h-full object-cover"/>
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <p className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">New Image Selected</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <AnalysisForm 
                                    form={item.form} 
                                    setForm={(nf:any) => updateForm(item.id, nf)} 
                                    disabled={!item.editMode}
                                />
                                
                                {/* ✅ ปุ่ม Re-Analyze */}
                                <button 
                                    onClick={() => handleReAnalyze(item.id)} 
                                    disabled={isProcessing === item.id || !item.editMode}
                                    className={`w-full mt-2 py-3 rounded-xl font-bold flex justify-center gap-2 items-center shadow-sm transition-all ${
                                        item.editMode 
                                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                                >
                                    {isProcessing === item.id ? <Loader2 className="animate-spin"/> : <RotateCcw className="w-5 h-5"/>}
                                    ประมวลผลอีกรอบ (Re-Analyze)
                                </button>
                            </div>
                            
                            {/* Right Col: Result & Edit/Save */}
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
                                
                                {/* ✅ ปุ่ม Edit / Save */}
                                <div className="mt-6 pt-4 border-t flex justify-end gap-3">
                                    <button 
                                        onClick={() => toggleEdit(item.id, true)} 
                                        disabled={item.editMode} 
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold border transition-all ${item.editMode ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                                    >
                                        <Edit2 className="w-4 h-4"/> แก้ไขข้อมูล
                                    </button>
                                    <button 
                                        onClick={() => toggleEdit(item.id, false)} 
                                        disabled={!item.editMode} 
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${!item.editMode ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 shadow-md'}`}
                                    >
                                        <Save className="w-4 h-4"/> บันทึกข้อมูล
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}