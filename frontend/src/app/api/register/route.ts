import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // เช็คว่าอีเมลซ้ำไหม
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ error: "อีเมลนี้มีผู้ใช้แล้ว" }, { status: 400 });

    // สร้าง User ใหม่
    const newUser = await prisma.user.create({
      data: { name, email, password }
    });
    return NextResponse.json(newUser);
  } catch (error) {
    return NextResponse.json({ error: "Register Failed" }, { status: 500 });
  }
}