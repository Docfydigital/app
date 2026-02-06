"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  KanbanSquare,
  Bell,
  CheckSquare,
  Webhook,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contacts", label: "Contatos", icon: Users },
  { href: "/conversations", label: "Conversas", icon: MessageSquare },
  { href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { href: "/alerts", label: "Alertas", icon: Bell },
  { href: "/tasks", label: "Tarefas", icon: CheckSquare },
  { href: "/webhooks", label: "Webhooks", icon: Webhook },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-800 text-slate-200 flex flex-col z-50">
      <div className="p-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-7 h-7 text-green-400" />
          <div>
            <h1 className="text-lg font-bold text-white">WhatsApp CRM</h1>
            <p className="text-xs text-slate-400">Powered by n8n</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-5 py-3 text-sm transition-colors",
                isActive
                  ? "bg-slate-700 text-white border-r-2 border-green-400"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-400">
          <p>Webhook URL:</p>
          <code className="text-green-400 text-[10px] break-all">
            /api/webhook
          </code>
        </div>
      </div>
    </aside>
  );
}
