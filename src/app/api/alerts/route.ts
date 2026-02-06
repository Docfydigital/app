import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "";
  const priority = searchParams.get("priority") || "";

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const alerts = await prisma.alert.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { contact: { select: { id: true, name: true, phone: true } } },
    take: 100,
  });

  return NextResponse.json(alerts);
}
