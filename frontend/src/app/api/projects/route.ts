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
  } catch (error) {
    console.error("GET projects error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // สร้าง default user ถ้ายังไม่มี
    const defaultUser = await prisma.user.upsert({
      where: { email: "default@cancer-ai.app" },
      update: {},
      create: { email: "default@cancer-ai.app", name: "Default User", password: "default" },
    });

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

    return NextResponse.json(newProject);
  } catch (error) {
    console.error("POST project error:", error);
    return NextResponse.json({ error: "Failed to save project" }, { status: 500 });
  }
}