# WhatsApp CRM - Especificacao do Projeto

## Visao Geral

CRM integrado com WhatsApp via n8n para gerenciamento de conversas, contatos e pipeline de vendas. O chatbot do WhatsApp encaminha conversas relevantes para o CRM atraves de webhooks orquestrados pelo n8n.

---

## Arquitetura

```
┌──────────────┐     ┌──────────┐     ┌─────────────────────┐
│   WhatsApp   │────>│   n8n    │────>│     CRM (este app)  │
│   Chatbot    │     │ Workflow │     │                     │
└──────────────┘     └──────────┘     │  ┌───────────────┐  │
                                      │  │  Webhook API  │  │
                                      │  └───────┬───────┘  │
                                      │          │          │
                                      │  ┌───────▼───────┐  │
                                      │  │   Roteador    │  │
                                      │  └───┬───┬───┬───┘  │
                                      │      │   │   │      │
                                      │  ┌───▼┐ ┌▼──┐┌▼───┐ │
                                      │  │CRM │ │Bot││Ale- │ │
                                      │  │Core│ │Tools││rtas│ │
                                      │  └────┘ └───┘└────┘ │
                                      └─────────────────────┘
```

## Fluxo Principal

1. **Cliente envia mensagem** no WhatsApp
2. **Chatbot processa** a mensagem (IA/regras)
3. **Chatbot decide** se precisa encaminhar ao CRM
4. **n8n recebe** o trigger do chatbot
5. **n8n chama webhook** do CRM com os dados
6. **CRM processa**: cria/atualiza contato, conversa, move no pipeline, dispara alertas

---

## Stack Tecnica

| Camada       | Tecnologia                  |
| ------------ | --------------------------- |
| Framework    | Next.js 14 (App Router)     |
| Linguagem    | TypeScript                  |
| Estilo       | Tailwind CSS + shadcn/ui    |
| Banco        | SQLite (Prisma ORM)         |
| Autenticacao | NextAuth.js (futuramente)   |
| Realtime     | Server-Sent Events (SSE)    |
| Deploy       | Vercel / VPS                |

---

## Modulos do Sistema

### 1. Webhook API (`/api/webhook`)

Endpoint que recebe chamadas do n8n.

**POST /api/webhook/inbound**

```json
{
  "event": "new_message | new_contact | update_status | assistant_action",
  "source": "whatsapp",
  "timestamp": "2026-02-06T12:00:00Z",
  "data": {
    "phone": "+5511999999999",
    "name": "Joao Silva",
    "message": "Quero saber sobre o plano premium",
    "assistant_id": "asst_abc123",
    "metadata": {}
  }
}
```

**Eventos suportados:**

| Evento             | Descricao                                  |
| ------------------ | ------------------------------------------ |
| `new_message`      | Nova mensagem recebida do WhatsApp         |
| `new_contact`      | Novo contato identificado                  |
| `update_status`    | Atualizacao de status do contato/conversa  |
| `assistant_action` | Acao executada por um assistente (tool/alerta) |
| `move_pipeline`    | Mover contato para outro estagio           |
| `create_alert`     | Criar alerta/notificacao                   |
| `create_task`      | Criar tarefa associada ao contato          |

---

### 2. Contatos (`/contacts`)

Gerenciamento completo de contatos.

**Campos:**
- Nome, telefone, email
- Tags/labels
- Origem (whatsapp, manual, importacao)
- Estagio no pipeline
- Score/pontuacao
- Notas
- Historico de conversas

---

### 3. Conversas (`/conversations`)

Visualizacao do historico de mensagens.

- Timeline de mensagens por contato
- Status: aberta, em andamento, resolvida, arquivada
- Atribuicao a atendente
- Tags de contexto (vendas, suporte, duvida)

---

### 4. Pipeline / Kanban (`/pipeline`)

Gestao visual de funil de vendas.

**Estagios padrao:**
1. Novo Lead
2. Primeiro Contato
3. Qualificado
4. Proposta Enviada
5. Negociacao
6. Fechado (Ganho)
7. Fechado (Perdido)

- Drag & drop entre estagios
- Filtros por tag, atendente, data
- Valores monetarios por deal

---

### 5. Alertas e Notificacoes (`/alerts`)

Sistema de alertas gerados pelos assistentes ou regras.

**Tipos:**
- `urgent` - Alerta urgente (cliente insatisfeito, reclamacao)
- `follow_up` - Lembrete de follow-up
- `opportunity` - Oportunidade detectada pelo assistente
- `task` - Tarefa criada pelo assistente
- `system` - Alerta do sistema

**Campos:**
- Tipo, titulo, descricao
- Contato relacionado
- Prioridade (low, medium, high, critical)
- Status (pending, seen, resolved)
- Criado por (assistente/sistema/manual)

---

### 6. Tools dos Assistentes (`/api/webhook/tools`)

Acoes que os assistentes do n8n podem executar no CRM.

| Tool                 | Descricao                              |
| -------------------- | -------------------------------------- |
| `create_contact`     | Criar novo contato                     |
| `update_contact`     | Atualizar dados do contato             |
| `add_note`           | Adicionar nota ao contato              |
| `move_pipeline`      | Mover contato no pipeline              |
| `create_alert`       | Criar alerta/notificacao               |
| `create_task`        | Criar tarefa                           |
| `tag_contact`        | Adicionar tag ao contato               |
| `assign_agent`       | Atribuir atendente                     |
| `log_message`        | Registrar mensagem na conversa         |
| `get_contact_info`   | Buscar info do contato (retorna JSON)  |
| `search_contacts`    | Buscar contatos por criterio           |

**Exemplo de chamada (n8n -> CRM):**

```json
{
  "event": "assistant_action",
  "data": {
    "tool": "create_alert",
    "params": {
      "contact_phone": "+5511999999999",
      "type": "opportunity",
      "title": "Cliente interessado no plano premium",
      "priority": "high",
      "description": "Cliente perguntou 3x sobre precos do plano premium"
    }
  }
}
```

---

### 7. Dashboard (`/dashboard`)

Visao geral do CRM.

- Total de contatos, conversas ativas, alertas pendentes
- Pipeline resumido (quantos em cada estagio)
- Ultimos alertas
- Ultimas conversas
- Grafico de conversas por dia (7 dias)

---

## Estrutura de Pastas

```
app/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard
│   │   ├── contacts/
│   │   │   └── page.tsx
│   │   ├── conversations/
│   │   │   └── page.tsx
│   │   ├── pipeline/
│   │   │   └── page.tsx
│   │   ├── alerts/
│   │   │   └── page.tsx
│   │   └── api/
│   │       └── webhook/
│   │           └── route.ts
│   ├── components/
│   │   ├── ui/                   # shadcn components
│   │   ├── sidebar.tsx
│   │   ├── contact-card.tsx
│   │   ├── pipeline-board.tsx
│   │   ├── alert-item.tsx
│   │   └── conversation-timeline.tsx
│   └── lib/
│       ├── db.ts                 # Prisma client
│       ├── webhook-handler.ts    # Logica dos webhooks
│       └── tools.ts              # Registry das tools
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── SPEC.md
```

---

## Modelo de Dados (Prisma)

```prisma
model Contact {
  id          String   @id @default(cuid())
  name        String
  phone       String   @unique
  email       String?
  tags        String   @default("[]")       // JSON array
  source      String   @default("whatsapp")
  pipelineStage String @default("new_lead")
  score       Int      @default(0)
  notes       String?
  assignedTo  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  conversations Conversation[]
  alerts        Alert[]
  tasks         Task[]
  messages      Message[]
}

model Conversation {
  id         String   @id @default(cuid())
  contactId  String
  status     String   @default("open")     // open, in_progress, resolved, archived
  context    String   @default("general")  // sales, support, question
  assignedTo String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  contact  Contact   @relation(fields: [contactId], references: [id])
  messages Message[]
}

model Message {
  id             String   @id @default(cuid())
  conversationId String
  contactId      String
  direction      String                    // inbound, outbound
  content        String
  sender         String                    // phone number or "system" or "assistant"
  metadata       String   @default("{}")   // JSON
  createdAt      DateTime @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id])
  contact      Contact      @relation(fields: [contactId], references: [id])
}

model Alert {
  id          String   @id @default(cuid())
  contactId   String?
  type        String                       // urgent, follow_up, opportunity, task, system
  title       String
  description String?
  priority    String   @default("medium")  // low, medium, high, critical
  status      String   @default("pending") // pending, seen, resolved
  createdBy   String   @default("system")  // system, assistant_id, manual
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  contact Contact? @relation(fields: [contactId], references: [id])
}

model Task {
  id          String   @id @default(cuid())
  contactId   String?
  title       String
  description String?
  dueDate     DateTime?
  status      String   @default("pending") // pending, in_progress, completed
  assignedTo  String?
  createdBy   String   @default("system")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  contact Contact? @relation(fields: [contactId], references: [id])
}

model PipelineStage {
  id       String @id @default(cuid())
  name     String
  slug     String @unique
  order    Int
  color    String @default("#6366f1")
}

model WebhookLog {
  id        String   @id @default(cuid())
  event     String
  payload   String                         // JSON
  status    String   @default("success")   // success, error
  error     String?
  createdAt DateTime @default(now())
}
```

---

## Configuracao do n8n

### Webhook no n8n

1. Criar workflow com trigger **Webhook**
2. URL do webhook: `https://seu-crm.com/api/webhook/inbound`
3. Metodo: POST
4. Autenticacao: Header `x-webhook-secret: SUA_CHAVE_SECRETA`

### Exemplo de workflow n8n:

```
[WhatsApp Trigger] -> [Code Node: formatar payload] -> [HTTP Request: POST /api/webhook/inbound]
```

### Payload de exemplo para cada tool:

**Criar contato:**
```json
{
  "event": "assistant_action",
  "data": {
    "tool": "create_contact",
    "params": { "name": "Maria", "phone": "+5511988887777" }
  }
}
```

**Mover no pipeline:**
```json
{
  "event": "move_pipeline",
  "data": {
    "phone": "+5511999999999",
    "stage": "qualified"
  }
}
```

**Criar alerta:**
```json
{
  "event": "assistant_action",
  "data": {
    "tool": "create_alert",
    "params": {
      "contact_phone": "+5511999999999",
      "type": "urgent",
      "title": "Cliente quer cancelar",
      "priority": "critical"
    }
  }
}
```

---

## Resumo do que o sistema faz

| Funcionalidade         | Status   |
| ---------------------- | -------- |
| Receber webhooks n8n   | Incluso  |
| Gerenciar contatos     | Incluso  |
| Historico de conversas | Incluso  |
| Pipeline Kanban        | Incluso  |
| Alertas/notificacoes   | Incluso  |
| Tools para assistentes | Incluso  |
| Tasks/tarefas          | Incluso  |
| Dashboard              | Incluso  |
| Logs de webhooks       | Incluso  |
| Autenticacao           | Futuro   |
| Multi-tenancy          | Futuro   |
| Relatorios avancados   | Futuro   |
| Integracoes extras     | Futuro   |
