"use client";

import { useEffect, useState } from "react";
import { Webhook, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WebhookLog {
  id: string;
  event: string;
  payload: string;
  status: string;
  error: string | null;
  createdAt: string;
}

export default function WebhooksPage() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/webhooks")
      .then((r) => r.json())
      .then(setLogs);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Webhook className="w-6 h-6" /> Webhook Logs
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 p-5">
        <h3 className="font-semibold mb-2">Configuracao</h3>
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-slate-500">Endpoint:</span>{" "}
            <code className="bg-slate-100 px-2 py-0.5 rounded text-indigo-600">
              POST /api/webhook
            </code>
          </p>
          <p>
            <span className="text-slate-500">Autenticacao (opcional):</span>{" "}
            <code className="bg-slate-100 px-2 py-0.5 rounded">
              Header: x-webhook-secret
            </code>
          </p>
          <details className="mt-3">
            <summary className="cursor-pointer text-indigo-600 text-sm">
              Ver exemplo de payload
            </summary>
            <pre className="mt-2 bg-slate-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
              {JSON.stringify(
                {
                  event: "new_message",
                  source: "whatsapp",
                  data: {
                    phone: "+5511999999999",
                    name: "Joao Silva",
                    message: "Quero saber sobre o plano premium",
                  },
                },
                null,
                2
              )}
            </pre>
          </details>
        </div>
      </div>

      <div className="space-y-2">
        {logs.map((log) => (
          <div
            key={log.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm"
          >
            <button
              onClick={() =>
                setExpanded(expanded === log.id ? null : log.id)
              }
              className="w-full text-left p-4 flex items-center gap-3"
            >
              {log.status === "success" ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">
                {log.event}
              </span>
              <span className="text-xs text-slate-400 ml-auto">
                {formatDistanceToNow(new Date(log.createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </button>
            {expanded === log.id && (
              <div className="px-4 pb-4">
                <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-64">
                  {JSON.stringify(JSON.parse(log.payload), null, 2)}
                </pre>
                {log.error && (
                  <p className="text-red-500 text-xs mt-2">
                    Erro: {log.error}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Webhook className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum webhook recebido ainda</p>
          </div>
        )}
      </div>
    </div>
  );
}
