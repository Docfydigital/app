import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(data.status && { status: data.status }),
      ...(data.assignedTo !== undefined && { assignedTo: data.assignedTo }),
    },
  });

  return NextResponse.json(task);
}
