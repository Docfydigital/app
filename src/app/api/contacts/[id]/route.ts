import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      conversations: { orderBy: { updatedAt: "desc" }, take: 10 },
      alerts: { orderBy: { createdAt: "desc" }, take: 10 },
      tasks: { orderBy: { createdAt: "desc" }, take: 10 },
      messages: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  if (!contact) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(contact);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
  if (data.pipelineStage !== undefined) updateData.pipelineStage = data.pipelineStage;
  if (data.score !== undefined) updateData.score = data.score;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
  if (data.dealValue !== undefined) updateData.dealValue = data.dealValue;

  const contact = await prisma.contact.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(contact);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.contact.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
