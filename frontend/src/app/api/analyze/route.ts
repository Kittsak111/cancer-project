import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const apiUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  console.log("=== ANALYZE PROXY ===");
  console.log("BACKEND_URL:", process.env.BACKEND_URL);
  console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
  console.log("Using apiUrl:", apiUrl);

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // สร้าง FormData ใหม่เพื่อส่งต่อ
    const newFormData = new FormData();
    newFormData.append("file", file);

    console.log("Sending request to:", `${apiUrl}/analyze`);

    const res = await fetch(`${apiUrl}/analyze`, {
      method: "POST",
      body: newFormData,
    });

    console.log("Backend response status:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend error:", errorText);
      return NextResponse.json({ error: "Backend error: " + errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Proxy error:", error.message);
    return NextResponse.json(
      { error: `Can't connect to AI Server (${apiUrl}): ${error.message}` },
      { status: 500 }
    );
  }
}
