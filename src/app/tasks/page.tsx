"use client";

import { useEffect, useState } from "react";
import { CheckSquare, Circle, Clock, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: string;
  assignedTo: string | null;
  createdBy: string;
  createdAt: string;
  contact: { id: string; name: string; phone: string } | null;
}

const statusIcons: Record<string, React.ElementType> = {
  pending: Circle,
  in_progress: Clock,
  completed: CheckCircle2,
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState("");

  const loadTasks = () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/tasks?${params}`)
      .then((r) => r.json())
      .then(setTasks);
  };

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadTasks();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <CheckSquare className="w-6 h-6" /> Tarefas
      </h1>

      <div className="flex gap-2 mb-6">
        {["", "pending", "in_progress", "completed"].map((s) => (
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
              ? "Todas"
              : s === "pending"
                ? "Pendentes"
                : s === "in_progress"
                  ? "Em andamento"
                  : "Concluidas"}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {tasks.map((task) => {
          const Icon = statusIcons[task.status] || Circle;
          return (
            <div
              key={task.id}
              className={`bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-start gap-3 ${
                task.status === "completed" ? "opacity-60" : ""
              }`}
            >
              <button
                onClick={() =>
                  updateStatus(
                    task.id,
                    task.status === "completed"
                      ? "pending"
                      : task.status === "pending"
                        ? "in_progress"
                        : "completed"
                  )
                }
                className="mt-0.5"
              >
                <Icon
                  className={`w-5 h-5 ${
                    task.status === "completed"
                      ? "text-green-500"
                      : task.status === "in_progress"
                        ? "text-blue-500"
                        : "text-slate-300"
                  }`}
                />
              </button>
              <div className="flex-1 min-w-0">
                <h3
                  className={`text-sm font-medium ${task.status === "completed" ? "line-through" : ""}`}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {task.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  {task.contact && (
                    <span>
                      {task.contact.name}
                    </span>
                  )}
                  {task.assignedTo && <span>Atribuido: {task.assignedTo}</span>}
                  {task.dueDate && (
                    <span>
                      Vence:{" "}
                      {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                  <span>
                    {formatDistanceToNow(new Date(task.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {tasks.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma tarefa encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
