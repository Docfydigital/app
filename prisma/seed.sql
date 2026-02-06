INSERT OR REPLACE INTO PipelineStage (id, name, slug, "order", color) VALUES
  ('stg_new_lead', 'Novo Lead', 'new_lead', 1, '#8b5cf6'),
  ('stg_first_contact', 'Primeiro Contato', 'first_contact', 2, '#6366f1'),
  ('stg_qualified', 'Qualificado', 'qualified', 3, '#3b82f6'),
  ('stg_proposal_sent', 'Proposta Enviada', 'proposal_sent', 4, '#f59e0b'),
  ('stg_negotiation', 'Negociacao', 'negotiation', 5, '#f97316'),
  ('stg_closed_won', 'Fechado (Ganho)', 'closed_won', 6, '#22c55e'),
  ('stg_closed_lost', 'Fechado (Perdido)', 'closed_lost', 7, '#ef4444');
