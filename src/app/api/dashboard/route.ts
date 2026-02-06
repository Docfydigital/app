import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [
    totalContacts,
    activeConversations,
    pendingAlerts,
    pendingTasks,
    recentAlerts,
    recentConversations,
    pipelineCounts,
  ] = await Promise.all([
    prisma.contact.count(),
    prisma.conversation.count({ where: { status: { in: ["open", "in_progress"] } } }),
    prisma.alert.count({ where: { status: "pending" } }),
    prisma.task.count({ where: { status: "pending" } }),
    prisma.alert.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { contact: { select: { name: true, phone: true } } },
    }),
    prisma.conversation.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        contact: { select: { name: true, phone: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    prisma.contact.groupBy({
      by: ["pipelineStage"],
      _count: { id: true },
    }),
  ]);

  // Conversations per day (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentMessages = await prisma.message.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true },
  });

  const messagesPerDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    messagesPerDay[key] = 0;
  }
  for (const msg of recentMessages) {
    const key = msg.createdAt.toISOString().split("T")[0];
    if (messagesPerDay[key] !== undefined) {
      messagesPerDay[key]++;
    }
  }

  return NextResponse.json({
    stats: {
      totalContacts,
      activeConversations,
      pendingAlerts,
      pendingTasks,
    },
    recentAlerts,
    recentConversations,
    pipelineCounts: pipelineCounts.map((p) => ({
      stage: p.pipelineStage,
      count: p._count.id,
    })),
    messagesPerDay,
  });
}
