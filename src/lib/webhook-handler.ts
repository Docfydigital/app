import { prisma } from "./db";

interface WebhookPayload {
  event: string;
  source?: string;
  timestamp?: string;
  data: Record<string, unknown>;
}

export async function handleWebhook(payload: WebhookPayload) {
  // Log the webhook
  await prisma.webhookLog.create({
    data: {
      event: payload.event,
      payload: JSON.stringify(payload),
    },
  });

  switch (payload.event) {
    case "new_message":
      return handleNewMessage(payload.data);
    case "new_contact":
      return handleNewContact(payload.data);
    case "update_status":
      return handleUpdateStatus(payload.data);
    case "move_pipeline":
      return handleMovePipeline(payload.data);
    case "create_alert":
      return handleCreateAlert(payload.data);
    case "create_task":
      return handleCreateTask(payload.data);
    case "assistant_action":
      return handleAssistantAction(payload.data);
    default:
      return { success: false, error: `Unknown event: ${payload.event}` };
  }
}

async function handleNewMessage(data: Record<string, unknown>) {
  const phone = data.phone as string;
  const message = data.message as string;
  const name = (data.name as string) || "Desconhecido";
  const direction = (data.direction as string) || "inbound";
  const sender = (data.sender as string) || phone;

  // Find or create contact
  let contact = await prisma.contact.findUnique({ where: { phone } });
  if (!contact) {
    contact = await prisma.contact.create({
      data: { name, phone },
    });
  }

  // Find or create open conversation
  let conversation = await prisma.conversation.findFirst({
    where: { contactId: contact.id, status: { in: ["open", "in_progress"] } },
    orderBy: { updatedAt: "desc" },
  });
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { contactId: contact.id },
    });
  }

  // Create message
  const msg = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      contactId: contact.id,
      direction,
      content: message,
      sender,
      metadata: JSON.stringify(data.metadata || {}),
    },
  });

  return { success: true, contactId: contact.id, conversationId: conversation.id, messageId: msg.id };
}

async function handleNewContact(data: Record<string, unknown>) {
  const phone = data.phone as string;
  const name = (data.name as string) || "Desconhecido";
  const email = data.email as string | undefined;
  const tags = data.tags as string[] | undefined;
  const source = (data.source as string) || "whatsapp";

  const contact = await prisma.contact.upsert({
    where: { phone },
    update: { name, email, source, ...(tags ? { tags: JSON.stringify(tags) } : {}) },
    create: { name, phone, email, source, tags: JSON.stringify(tags || []) },
  });

  return { success: true, contactId: contact.id };
}

async function handleUpdateStatus(data: Record<string, unknown>) {
  const phone = data.phone as string;
  const status = data.status as string;

  const contact = await prisma.contact.findUnique({ where: { phone } });
  if (!contact) return { success: false, error: "Contact not found" };

  if (data.conversation_status) {
    const conversation = await prisma.conversation.findFirst({
      where: { contactId: contact.id },
      orderBy: { updatedAt: "desc" },
    });
    if (conversation) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { status: data.conversation_status as string },
      });
    }
  }

  if (status) {
    await prisma.contact.update({
      where: { id: contact.id },
      data: { pipelineStage: status },
    });
  }

  return { success: true, contactId: contact.id };
}

async function handleMovePipeline(data: Record<string, unknown>) {
  const phone = data.phone as string;
  const stage = data.stage as string;

  const contact = await prisma.contact.findUnique({ where: { phone } });
  if (!contact) return { success: false, error: "Contact not found" };

  await prisma.contact.update({
    where: { id: contact.id },
    data: { pipelineStage: stage },
  });

  return { success: true, contactId: contact.id, stage };
}

async function handleCreateAlert(data: Record<string, unknown>) {
  const phone = data.contact_phone as string | undefined;
  let contactId: string | undefined;

  if (phone) {
    const contact = await prisma.contact.findUnique({ where: { phone } });
    contactId = contact?.id;
  }

  const alert = await prisma.alert.create({
    data: {
      contactId: contactId || null,
      type: (data.type as string) || "system",
      title: (data.title as string) || "Alerta",
      description: data.description as string | undefined,
      priority: (data.priority as string) || "medium",
      createdBy: (data.created_by as string) || "system",
    },
  });

  return { success: true, alertId: alert.id };
}

async function handleCreateTask(data: Record<string, unknown>) {
  const phone = data.contact_phone as string | undefined;
  let contactId: string | undefined;

  if (phone) {
    const contact = await prisma.contact.findUnique({ where: { phone } });
    contactId = contact?.id;
  }

  const task = await prisma.task.create({
    data: {
      contactId: contactId || null,
      title: (data.title as string) || "Tarefa",
      description: data.description as string | undefined,
      dueDate: data.due_date ? new Date(data.due_date as string) : null,
      assignedTo: data.assigned_to as string | undefined,
      createdBy: (data.created_by as string) || "system",
    },
  });

  return { success: true, taskId: task.id };
}

async function handleAssistantAction(data: Record<string, unknown>) {
  const tool = data.tool as string;
  const params = (data.params as Record<string, unknown>) || {};

  switch (tool) {
    case "create_contact":
      return handleNewContact(params);
    case "update_contact": {
      const phone = params.phone as string;
      const contact = await prisma.contact.findUnique({ where: { phone } });
      if (!contact) return { success: false, error: "Contact not found" };
      const updateData: Record<string, unknown> = {};
      if (params.name) updateData.name = params.name;
      if (params.email) updateData.email = params.email;
      if (params.score !== undefined) updateData.score = params.score;
      if (params.notes) updateData.notes = params.notes;
      if (params.assigned_to) updateData.assignedTo = params.assigned_to;
      await prisma.contact.update({ where: { id: contact.id }, data: updateData });
      return { success: true, contactId: contact.id };
    }
    case "add_note": {
      const phone = params.phone as string;
      const contact = await prisma.contact.findUnique({ where: { phone } });
      if (!contact) return { success: false, error: "Contact not found" };
      const existingNotes = contact.notes || "";
      const newNote = `[${new Date().toISOString()}] ${params.note}\n`;
      await prisma.contact.update({
        where: { id: contact.id },
        data: { notes: existingNotes + newNote },
      });
      return { success: true, contactId: contact.id };
    }
    case "move_pipeline":
      return handleMovePipeline({ phone: params.phone || params.contact_phone, stage: params.stage });
    case "create_alert":
      return handleCreateAlert(params);
    case "create_task":
      return handleCreateTask(params);
    case "tag_contact": {
      const phone = params.phone as string;
      const contact = await prisma.contact.findUnique({ where: { phone } });
      if (!contact) return { success: false, error: "Contact not found" };
      const currentTags: string[] = JSON.parse(contact.tags);
      const newTag = params.tag as string;
      if (!currentTags.includes(newTag)) currentTags.push(newTag);
      await prisma.contact.update({
        where: { id: contact.id },
        data: { tags: JSON.stringify(currentTags) },
      });
      return { success: true, contactId: contact.id, tags: currentTags };
    }
    case "assign_agent": {
      const phone = params.phone as string;
      const contact = await prisma.contact.findUnique({ where: { phone } });
      if (!contact) return { success: false, error: "Contact not found" };
      await prisma.contact.update({
        where: { id: contact.id },
        data: { assignedTo: params.agent as string },
      });
      return { success: true, contactId: contact.id };
    }
    case "log_message":
      return handleNewMessage({
        phone: params.phone || params.contact_phone,
        message: params.message || params.content,
        direction: params.direction || "outbound",
        sender: params.sender || "assistant",
      });
    case "get_contact_info": {
      const phone = params.phone as string;
      const contact = await prisma.contact.findUnique({
        where: { phone },
        include: { conversations: { take: 5, orderBy: { updatedAt: "desc" } }, alerts: { take: 5 } },
      });
      if (!contact) return { success: false, error: "Contact not found" };
      return { success: true, contact };
    }
    case "search_contacts": {
      const query = params.query as string;
      const contacts = await prisma.contact.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { phone: { contains: query } },
            { email: { contains: query } },
          ],
        },
        take: 20,
      });
      return { success: true, contacts };
    }
    default:
      return { success: false, error: `Unknown tool: ${tool}` };
  }
}
