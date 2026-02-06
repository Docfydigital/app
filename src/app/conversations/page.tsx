"use client";

import { useEffect, useState } from "react";
import { MessageSquare, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Conversation {
  id: string;
  status: string;
  context: string;
  updatedAt: string;
  contact: { id: string; name: string; phone: string };
  messages: Array<{ content: string; createdAt: string }>;
  _count: { messages: number };
}

interface ConversationDetail {
  id: string;
  status: string;
  context: string;
  contact: { name: string; phone: string };
  messages: Array<{
    id: string;
    direction: string;
    content: string;
    sender: string;
    createdAt: string;
  }>;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  open: { label: "Aberta", color: "bg-green-100 text-green-700" },
  in_progress: { label: "Em andamento", color: "bg-blue-100 text-blue-700" },
  resolved: { label: "Resolvida", color: "bg-slate-100 text-slate-700" },
  archived: { label: "Arquivada", color: "bg-gray-100 text-gray-500" },
};

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<ConversationDetail | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const loadConversations = () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/conversations?${params}`)
      .then((r) => r.json())
      .then(setConversations);
  };

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadDetail = (id: string) => {
    fetch(`/api/conversations/${id}`)
      .then((r) => r.json())
      .then(setSelected);
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadConversations();
    if (selected?.id === id) loadDetail(id);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6" /> Conversas
      </h1>

      <div className="flex gap-2 mb-6">
        {["", "open", "in_progress", "resolved", "archived"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              statusFilter === s
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {s === "" ? "Todas" : statusLabels[s]?.label || s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation list */}
        <div className="lg:col-span-1 space-y-2">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => loadDetail(conv.id)}
              className={`w-full text-left p-4 rounded-xl border transition ${
                selected?.id === conv.id
                  ? "bg-indigo-50 border-indigo-300"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{conv.contact.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded ${statusLabels[conv.status]?.color || "bg-gray-100"}`}
                >
                  {statusLabels[conv.status]?.label || conv.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">{conv.contact.phone}</p>
              {conv.messages[0] && (
                <p className="text-xs text-slate-500 mt-2 truncate">
                  {conv.messages[0].content}
                </p>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-slate-400">
                  {conv._count.messages} mensagens
                </span>
                <span className="text-[10px] text-slate-400">
                  {formatDistanceToNow(new Date(conv.updatedAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
            </button>
          ))}
          {conversations.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              Nenhuma conversa encontrada
            </div>
          )}
        </div>

        {/* Conversation detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-xl border border-slate-200 h-[calc(100vh-12rem)] flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{selected.contact.name}</h3>
                  <p className="text-xs text-slate-400">
                    {selected.contact.phone}
                  </p>
                </div>
                <select
                  value={selected.status}
                  onChange={(e) => updateStatus(selected.id, e.target.value)}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="open">Aberta</option>
                  <option value="in_progress">Em andamento</option>
                  <option value="resolved">Resolvida</option>
                  <option value="archived">Arquivada</option>
                </select>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selected.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        msg.direction === "outbound"
                          ? "bg-green-500 text-white rounded-br-md"
                          : "bg-slate-100 text-slate-800 rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p
                        className={`text-[10px] mt-1 ${msg.direction === "outbound" ? "text-green-100" : "text-slate-400"}`}
                      >
                        {msg.sender} -{" "}
                        {new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {selected.messages.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    Nenhuma mensagem
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 h-[calc(100vh-12rem)] flex items-center justify-center">
              <div className="text-center text-slate-400">
                <ArrowRight className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Selecione uma conversa</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
