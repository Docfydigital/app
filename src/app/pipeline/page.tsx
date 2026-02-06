"use client";

import { useEffect, useState } from "react";
import { KanbanSquare, DollarSign } from "lucide-react";
import { PIPELINE_STAGES } from "@/lib/pipeline-stages";

interface Contact {
  id: string;
  name: string;
  phone: string;
  pipelineStage: string;
  score: number;
  dealValue: number | null;
  tags: string;
  createdAt: string;
}

export default function PipelinePage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);

  const loadContacts = () => {
    fetch("/api/contacts")
      .then((r) => r.json())
      .then(setContacts);
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const moveContact = async (contactId: string, newStage: string) => {
    await fetch(`/api/contacts/${contactId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pipelineStage: newStage }),
    });
    loadContacts();
  };

  const handleDragStart = (contactId: string) => {
    setDragging(contactId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stageSlug: string) => {
    if (dragging) {
      moveContact(dragging, stageSlug);
      setDragging(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <KanbanSquare className="w-6 h-6" /> Pipeline
      </h1>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageContacts = contacts.filter(
            (c) => c.pipelineStage === stage.slug
          );
          const totalValue = stageContacts.reduce(
            (sum, c) => sum + (c.dealValue || 0),
            0
          );

          return (
            <div
              key={stage.slug}
              className="flex-shrink-0 w-72"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.slug)}
            >
              {/* Stage header */}
              <div
                className="rounded-t-xl px-4 py-3 text-white text-sm font-semibold flex items-center justify-between"
                style={{ backgroundColor: stage.color }}
              >
                <span>{stage.name}</span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                  {stageContacts.length}
                </span>
              </div>

              {totalValue > 0 && (
                <div className="bg-white border-x border-slate-200 px-4 py-1.5 text-xs text-slate-500 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  R$ {totalValue.toLocaleString("pt-BR")}
                </div>
              )}

              {/* Cards */}
              <div className="bg-slate-50 border border-t-0 border-slate-200 rounded-b-xl p-2 space-y-2 min-h-[200px]">
                {stageContacts.map((contact) => {
                  const tags: string[] = JSON.parse(contact.tags || "[]");
                  return (
                    <div
                      key={contact.id}
                      draggable
                      onDragStart={() => handleDragStart(contact.id)}
                      className="bg-white rounded-lg p-3 shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md transition"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                          {contact.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium truncate">
                          {contact.name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-1">
                        {contact.phone}
                      </p>
                      {contact.dealValue && (
                        <p className="text-xs text-green-600 font-medium">
                          R$ {contact.dealValue.toLocaleString("pt-BR")}
                        </p>
                      )}
                      {tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
