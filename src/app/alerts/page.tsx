"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  AlertTriangle,
  Clock,
  Lightbulb,
  CheckCircle,
  Info,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Alert {
  id: string;
  type: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  createdBy: string;
  createdAt: string;
  contact: { id: string; name: string; phone: string } | null;
}

const typeConfig: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  urgent: { icon: AlertTriangle, color: "text-red-500", label: "Urgente" },
  follow_up: { icon: Clock, color: "text-blue-500", label: "Follow-up" },
  opportunity: {
    icon: Lightbulb,
    color: "text-yellow-500",
    label: "Oportunidade",
  },
  task: { icon: CheckCircle, color: "text-green-500", label: "Tarefa" },
  system: { icon: Info, color: "text-slate-500", label: "Sistema" },
};

const priorityColors: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [statusFilter, setStatusFilter] = useState("pending");

  const loadAlerts = () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/alerts?${params}`)
      .then((r) => r.json())
      .then(setAlerts);
  };

  useEffect(() => {
    loadAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadAlerts();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Bell className="w-6 h-6" /> Alertas
      </h1>

      <div className="flex gap-2 mb-6">
        {["pending", "seen", "resolved", ""].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              statusFilter === s
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {s === ""
              ? "Todos"
              : s === "pending"
                ? "Pendentes"
                : s === "seen"
                  ? "Vistos"
                  : "Resolvidos"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const config = typeConfig[alert.type] || typeConfig.system;
          const Icon = config.icon;
          return (
            <div
              key={alert.id}
              className={`bg-white rounded-xl p-4 border shadow-sm ${
                alert.status === "pending"
                  ? "border-l-4"
                  : "border border-slate-200"
              }`}
              style={
                alert.status === "pending"
                  ? {
                      borderLeftColor:
                        alert.priority === "critical"
                          ? "#ef4444"
                          : alert.priority === "high"
                            ? "#f97316"
                            : "#6366f1",
                    }
                  : undefined
              }
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 ${config.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold">{alert.title}</h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border ${priorityColors[alert.priority] || "bg-gray-100"}`}
                    >
                      {alert.priority}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {config.label}
                    </span>
                  </div>
                  {alert.description && (
                    <p className="text-sm text-slate-600 mb-1">
                      {alert.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    {alert.contact && (
                      <span>
                        {alert.contact.name} ({alert.contact.phone})
                      </span>
                    )}
                    <span>por {alert.createdBy}</span>
                    <span>
                      {formatDistanceToNow(new Date(alert.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {alert.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(alert.id, "seen")}
                        className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
                      >
                        Marcar visto
                      </button>
                      <button
                        onClick={() => updateStatus(alert.id, "resolved")}
                        className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100"
                      >
                        Resolver
                      </button>
                    </>
                  )}
                  {alert.status === "seen" && (
                    <button
                      onClick={() => updateStatus(alert.id, "resolved")}
                      className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100"
                    >
                      Resolver
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {alerts.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum alerta encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
