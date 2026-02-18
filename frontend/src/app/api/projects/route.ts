import { NextResponse } from "next/server";

// ข้อมูลจำลอง (Mock Data)
let MOCK_DB: any[] = [
  {
    id: 101,
    name: "การทดลองยา Cisplatin (ตัวอย่าง)",
    drugName: "Cisplatin",
    concentration: "10",
    description: "ตัวอย่างข้อมูล Mock Data สำหรับการนำเสนอ",
    createdAt: new Date().toISOString(),
    result: JSON.stringify({
      cell_count: 125,
      confluence: 45.5,
      avg_size: 320.2,
      size_distribution: { Small: 30, Medium: 60, Large: 35 },
      // ใส่รูป Base64 หลอกๆ หรือว่างไว้ก็ได้
      processed_image: "", 
      original_image: ""
    })
  }
];

export async function GET() {
  return NextResponse.json(MOCK_DB);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // จำลองการหน่วงเวลา (เหมือนกำลังบันทึกจริง)
    await new Promise(resolve => setTimeout(resolve, 800));

    const newProject = {
      id: Math.floor(Math.random() * 10000) + 100, // สุ่ม ID
      ...body,
      createdAt: new Date().toISOString()
    };
    
    // บันทึกลงตัวแปร (รีเฟรชหน้าเว็บหายนะ เพราะไม่ได้ลง DB จริง)
    MOCK_DB.unshift(newProject);

    return NextResponse.json(newProject);
  } catch (error) {
    return NextResponse.json({ error: "Mock Save Failed" }, { status: 500 });
  }
}