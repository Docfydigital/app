export const PIPELINE_STAGES = [
  { slug: "new_lead", name: "Novo Lead", color: "#8b5cf6" },
  { slug: "first_contact", name: "Primeiro Contato", color: "#6366f1" },
  { slug: "qualified", name: "Qualificado", color: "#3b82f6" },
  { slug: "proposal_sent", name: "Proposta Enviada", color: "#f59e0b" },
  { slug: "negotiation", name: "Negociacao", color: "#f97316" },
  { slug: "closed_won", name: "Fechado (Ganho)", color: "#22c55e" },
  { slug: "closed_lost", name: "Fechado (Perdido)", color: "#ef4444" },
] as const;

export function getStageName(slug: string): string {
  return PIPELINE_STAGES.find((s) => s.slug === slug)?.name ?? slug;
}

export function getStageColor(slug: string): string {
  return PIPELINE_STAGES.find((s) => s.slug === slug)?.color ?? "#6b7280";
}
