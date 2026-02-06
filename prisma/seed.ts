import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

const stages = [
  { name: "Novo Lead", slug: "new_lead", order: 1, color: "#8b5cf6" },
  { name: "Primeiro Contato", slug: "first_contact", order: 2, color: "#6366f1" },
  { name: "Qualificado", slug: "qualified", order: 3, color: "#3b82f6" },
  { name: "Proposta Enviada", slug: "proposal_sent", order: 4, color: "#f59e0b" },
  { name: "Negociacao", slug: "negotiation", order: 5, color: "#f97316" },
  { name: "Fechado (Ganho)", slug: "closed_won", order: 6, color: "#22c55e" },
  { name: "Fechado (Perdido)", slug: "closed_lost", order: 7, color: "#ef4444" },
];

async function main() {
  for (const stage of stages) {
    await prisma.pipelineStage.upsert({
      where: { slug: stage.slug },
      update: stage,
      create: stage,
    });
  }
  console.log("Seed completed: pipeline stages created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
