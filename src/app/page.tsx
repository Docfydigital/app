"use client";

import { useEffect, useState } from "react";
import {
  Users,
  MessageSquare,
  Bell,
  CheckSquare,
  TrendingUp,
} from "lucide-react";
import { getStageName, getStageColor } from "@/lib/pipeline-stages";

interface DashboardData {
  stats: {
    totalContacts: number;
    activeConversations: number;
    pendingAlerts: number;
    pendingTasks: number;
  };
  recentAlerts: Array<{
    id: string;
    type: string;
    title: string;
    priority: string;
    createdAt: string;
    contact?: { name: string; phone: string } | null;
  }>;
  recentConversations: Array<{
    id: string;
    status: string;
    updatedAt: string;
    contact: { name: string; phone: string };
    messages: Array<{ content: string }>;
  }>;
  pipelineCounts: Array<{ stage: string; count: number }>;
  messagesPerDay: Record<string, number>;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    critical: "bg-red-100 text-red-700",
    high: "bg-orange-100 text-orange-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${colors[priority] || "bg-gray-100 text-gray-700"}`}
    >
      {priority}
    </span>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
      </div>
    );
  }

  const maxMessages = Math.max(...Object.values(data.messagesPerDay), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Total Contatos"
          value={data.stats.totalContacts}
          color="bg-indigo-500"
        />
        <StatCard
          icon={MessageSquare}
          label="Conversas Ativas"
          value={data.stats.activeConversations}
          color="bg-blue-500"
        />
        <StatCard
          icon={Bell}
          label="Alertas Pendentes"
          value={data.stats.pendingAlerts}
          color="bg-orange-500"
        />
        <StatCard
          icon={CheckSquare}
          label="Tarefas Pendentes"
          value={data.stats.pendingTasks}
          color="bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Pipeline
          </h2>
          <div className="space-y-3">
            {data.pipelineCounts.map((p) => (
              <div key={p.stage} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getStageColor(p.stage) }}
                />
                <span className="text-sm flex-1">{getStageName(p.stage)}</span>
                <span className="text-sm font-semibold bg-slate-100 px-2 py-0.5 rounded">
                  {p.count}
                </span>
              </div>
            ))}
            {data.pipelineCounts.length === 0 && (
              <p className="text-sm text-slate-400">Nenhum contato no pipeline</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> Mensagens (7 dias)
          </h2>
          <div className="flex items-end gap-2 h-40">
            {Object.entries(data.messagesPerDay).map(([date, count]) => (
              <div key={date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-slate-500">{count}</span>
                <div
                  className="w-full bg-indigo-400 rounded-t min-h-[4px] transition-all"
                  style={{
                    height: `${(count / maxMessages) * 120}px`,
                  }}
                />
                <span className="text-[10px] text-slate-400">
                  {date.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" /> Alertas Recentes
          </h2>
          <div className="space-y-3">
            {data.recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{alert.title}</p>
                    <PriorityBadge priority={alert.priority} />
                  </div>
                  {alert.contact && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {alert.contact.name} - {alert.contact.phone}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {data.recentAlerts.length === 0 && (
              <p className="text-sm text-slate-400">Nenhum alerta</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> Conversas Recentes
          </h2>
          <div className="space-y-3">
            {data.recentConversations.map((conv) => (
              <div
                key={conv.id}
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm font-bold">
                  {conv.contact.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{conv.contact.name}</p>
                  <p className="text-xs text-slate-400">{conv.contact.phone}</p>
                  {conv.messages[0] && (
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {conv.messages[0].content}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {data.recentConversations.length === 0 && (
              <p className="text-sm text-slate-400">Nenhuma conversa</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
