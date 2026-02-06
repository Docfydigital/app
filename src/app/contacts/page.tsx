"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Search, Phone, Mail, Tag } from "lucide-react";
import { getStageColor, PIPELINE_STAGES } from "@/lib/pipeline-stages";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  tags: string;
  source: string;
  pipelineStage: string;
  score: number;
  dealValue: number | null;
  createdAt: string;
  _count: { conversations: number; alerts: number; tasks: number };
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });

  const loadContacts = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (stageFilter) params.set("stage", stageFilter);
    fetch(`/api/contacts?${params}`)
      .then((r) => r.json())
      .then(setContacts);
  };

  useEffect(() => {
    loadContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadContacts();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setFormData({ name: "", phone: "", email: "" });
    setShowForm(false);
    loadContacts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este contato?")) return;
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    loadContacts();
  };

  const handleStageChange = async (id: string, stage: string) => {
    await fetch(`/api/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pipelineStage: stage }),
    });
    loadContacts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" /> Contatos
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" /> Novo Contato
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6"
        >
          <h3 className="font-semibold mb-3">Novo Contato</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Nome"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Telefone (+55...)"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="email"
              placeholder="Email (opcional)"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
            >
              Criar
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="flex gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700"
          >
            Buscar
          </button>
        </form>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos os estagios</option>
          {PIPELINE_STAGES.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">
                Contato
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">
                Telefone
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">
                Estagio
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">
                Tags
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">
                Score
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">
                Acoes
              </th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => {
              const tags: string[] = JSON.parse(contact.tags || "[]");
              return (
                <tr
                  key={contact.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{contact.name}</p>
                        {contact.email && (
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {contact.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {contact.phone}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={contact.pipelineStage}
                      onChange={(e) => handleStageChange(contact.id, e.target.value)}
                      className="text-xs border rounded px-2 py-1"
                      style={{ borderColor: getStageColor(contact.pipelineStage) }}
                    >
                      {PIPELINE_STAGES.map((s) => (
                        <option key={s.slug} value={s.slug}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs"
                        >
                          <Tag className="w-3 h-3" /> {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium">{contact.score}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              );
            })}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Nenhum contato encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
