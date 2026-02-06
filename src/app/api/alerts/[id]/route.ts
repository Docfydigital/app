import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();

  const alert = await prisma.alert.update({
    where: { id },
    data: { status: data.status },
  });

  return NextResponse.json(alert);
}
