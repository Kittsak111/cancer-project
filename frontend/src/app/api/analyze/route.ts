import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // ใช้ environment variable ฝั่ง server (ไม่ต้อง NEXT_PUBLIC_)
    const apiUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const res = await fetch(`${apiUrl}/analyze`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Backend error" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Can't connect to AI Server" }, { status: 500 });
  }
}
