import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const stage = searchParams.get("stage") || "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { phone: { contains: search } },
      { email: { contains: search } },
    ];
  }
  if (stage) {
    where.pipelineStage = stage;
  }

  const contacts = await prisma.contact.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { conversations: true, alerts: true, tasks: true } },
    },
  });

  return NextResponse.json(contacts);
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const contact = await prisma.contact.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      tags: JSON.stringify(data.tags || []),
      source: data.source || "manual",
      pipelineStage: data.pipelineStage || "new_lead",
      notes: data.notes || null,
      dealValue: data.dealValue || null,
    },
  });
  return NextResponse.json(contact, { status: 201 });
}
