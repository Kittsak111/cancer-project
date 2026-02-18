import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(projects);
  } catch (error: any) {
    console.error("GET projects error:", error);
    return NextResponse.json({ error: "Failed to fetch: " + error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("=== SAVE PROJECT ===");
    console.log("name:", body.name);
    console.log("result length:", body.result ? body.result.length : 0);
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

    // สร้าง default user ถ้ายังไม่มี
    const defaultUser = await prisma.user.upsert({
      where: { email: "default@cancer-ai.app" },
      update: {},
      create: { email: "default@cancer-ai.app", name: "Default User", password: "default" },
    });

    console.log("Default user ID:", defaultUser.id);

    const newProject = await prisma.project.create({
      data: {
        name: body.name || "Untitled",
        drugName: body.drugName || null,
        concentration: body.concentration || null,
        description: body.description || null,
        result: body.result || null,
        userId: defaultUser.id,
      },
    });

    console.log("Project saved! ID:", newProject.id);
    return NextResponse.json(newProject);
  } catch (error: any) {
    console.error("POST project error:", error.message);
    console.error("Full error:", error);
    return NextResponse.json({ error: "Failed to save project: " + error.message }, { status: 500 });
  }
}