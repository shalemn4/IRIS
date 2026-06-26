import React, { useState } from "react";
import { Case, CaseSeverity, CaseStatus } from "../types";
import { Plus, Trash2, Edit3, CircleDot, Eye, Calendar, ShieldAlert } from "lucide-react";

interface CasesPageProps {
  cases: Case[];
  onCreateCase: (title: string, description: string, severity: CaseSeverity, status: CaseStatus) => void;
  onEditCase: (id: string, updates: Partial<Case>) => void;
  onDeleteCase: (id: string) => void;
  onOpenCase: (id: string) => void;
}

export default function CasesPage({
  cases,
  onCreateCase,
  onEditCase,
  onDeleteCase,
  onOpenCase,
}: CasesPageProps) {
  // Local state for creator inputs
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSeverity, setNewSeverity] = useState<CaseSeverity>("Medium");
  const [newStatus, setNewStatus] = useState<CaseStatus>("Open");

  // Local state for editing inputs
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSeverity, setEditSeverity] = useState<CaseSeverity>("Medium");
  const [editStatus, setEditStatus] = useState<CaseStatus>("Open");

  // Search/Filters parameters
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [severityFilter, setSeverityFilter] = useState<string>("All");

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateCase(newTitle, newDesc, newSeverity, newStatus);
    setNewTitle("");
    setNewDesc("");
    setNewSeverity("Medium");
    setNewStatus("Open");
    setShowCreateForm(false);
  };

  const handleEditClick = (c: Case) => {
    setEditingCaseId(c.id);
    setEditTitle(c.title);
    setEditDesc(c.description);
    setEditSeverity(c.severity);
    setEditStatus(c.status);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCaseId || !editTitle.trim()) return;
    onEditCase(editingCaseId, {
      title: editTitle,
      description: editDesc,
      severity: editSeverity,
      status: editStatus,
    });
    setEditingCaseId(null);
  };

  // Filter conditions
  const filteredCases = cases.filter((c) => {
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    const matchSeverity = severityFilter === "All" || c.severity === severityFilter;
    return matchStatus && matchSeverity;
  });

  return (
    <div id="cases-workspace-card" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Incident Forensics Locker</h2>
          <p className="text-xs text-slate-500">Track and manage active security investigation workspaces</p>
        </div>
        <button
          id="btn-trigger-case-creator"
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setEditingCaseId(null);
          }}
          className="text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-4.5 py-2.5 shadow-sm shadow-violet-100 flex items-center justify-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Log Security Incident
        </button>
      </div>

      {/* Slideout Creator Panel */}
      {showCreateForm && (
        <form
          id="case-creation-form"
          onSubmit={handleCreateSubmit}
          className="bg-white border border-violet-100/80 p-5 rounded-2xl shadow-sm space-y-4 max-w-2xl"
        >
          <h3 className="text-xs uppercase tracking-widest font-bold text-violet-700">Initialize New Dynamic Target Case</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Investigation Name / Incident Title</label>
              <input
                id="input-case-title"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Active Directory Hash Extraction WS-92"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white shadow-sm"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Core Description & Target Host</label>
              <textarea
                id="input-case-desc"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Enter scope of anomalous activity detected, targets affected..."
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white shadow-sm h-20 resize-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Severity Flag</label>
              <select
                id="select-case-severity"
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as CaseSeverity)}
                className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Initial Status</label>
              <select
                id="select-case-status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as CaseStatus)}
                className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="Open">Open</option>
                <option value="Investigating">Investigating</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2.5 pt-2">
            <button
              id="submit-case-btn"
              type="submit"
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Verify & Provision Case
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs rounded-lg font-medium cursor-pointer"
            >
              Discard
            </button>
          </div>
        </form>
      )}

      {/* Editing Dialog form Inline */}
      {editingCaseId && (
        <form
          id="case-edit-form"
          onSubmit={handleSaveEdit}
          className="bg-white border border-amber-200/80 p-5 rounded-2xl shadow-sm space-y-4 max-w-2xl"
        >
          <h3 className="text-xs uppercase tracking-widest font-bold text-amber-700">Modify Investigation Scope: {editingCaseId}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Incident Title</label>
              <input
                id="edit-case-title"
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white shadow-sm"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Incident Scope Description</label>
              <textarea
                id="edit-case-desc"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white shadow-sm h-20 resize-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Severity Flag</label>
              <select
                id="edit-case-severity"
                value={editSeverity}
                onChange={(e) => setEditSeverity(e.target.value as CaseSeverity)}
                className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-lg"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Workflow Status</label>
              <select
                id="edit-case-status"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as CaseStatus)}
                className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-lg"
              >
                <option value="Open">Open</option>
                <option value="Investigating">Investigating</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2.5 pt-2">
            <button
              id="submit-edit-btn"
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Save Parameters
            </button>
            <button
              type="button"
              onClick={() => setEditingCaseId(null)}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs rounded-lg font-medium cursor-pointer"
            >
              Cancel Edit
            </button>
          </div>
        </form>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white px-5 py-4.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-2">
          <CircleDot className="h-4 w-4 text-violet-500" />
          <span>Filters:</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[11px] px-1 text-slate-400 font-bold uppercase">Status</span>
          <select
            id="filter-status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 bg-white shadow-sm rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Investigating">Investigating</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] px-1 text-slate-400 font-bold uppercase">Severity</span>
          <select
            id="filter-severity-select"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="border border-slate-200 bg-white shadow-sm rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="All">All Severities</option>
            <option value="Low">Low</option>
            <option value="Medium font-bold">Medium</option>
            <option value="High font-bold">High</option>
            <option value="Critical font-bold">Critical</option>
          </select>
        </div>

        <div className="ml-auto font-mono text-[10.5px] text-slate-400 font-medium whitespace-nowrap">
          Displaying {filteredCases.length} of {cases.length} Security Cases
        </div>
      </div>

      {/* Cases Datatable List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredCases.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-slate-700">No active cases match search filters.</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">Create a new container or change active selection guidelines to view indicators.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-slate-200/80 text-slate-400 uppercase tracking-widest text-[9.5px] font-bold">
                  <th className="py-3 px-4">Case ID</th>
                  <th className="py-3 px-4">Incident Name & Host Targets</th>
                  <th className="py-3 px-4 text-center">Threat Severity</th>
                  <th className="py-3 px-4">Workflow status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((c) => {
                  return (
                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-slate-400">{c.id}</td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800 text-[13px]">{c.title}</div>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-1 max-w-md">{c.description}</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-3 py-0.5 rounded text-[10.5px] font-bold tracking-tight border capitalize ${
                          c.severity === "Critical" ? "bg-[#FED7AA] text-orange-950 border-orange-300 shadow-sm" :
                          c.severity === "High" ? "bg-amber-50 text-amber-600 border-amber-200" :
                          c.severity === "Medium" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"
                        }`}>
                          {c.severity}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          c.status === "Resolved" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                          c.status === "Investigating" ? "bg-[#EDE9FE] text-violet-700 border border-violet-200/50" : "bg-sky-50 text-sky-700 border border-sky-100"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            c.status === "Resolved" ? "bg-emerald-500" :
                            c.status === "Investigating" ? "bg-violet-500 animate-pulse" : "bg-sky-500"
                          }`}></span>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-medium font-sans">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {new Date(c.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`row-open-${c.id}`}
                            onClick={() => onOpenCase(c.id)}
                            title="Open Investigation Workspace"
                            className="bg-violet-50 hover:bg-violet-100 text-violet-700 hover:text-violet-900 duration-150 p-2 rounded-lg cursor-pointer flex items-center justify-center border border-violet-200/40"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            id={`row-edit-${c.id}`}
                            onClick={() => handleEditClick(c)}
                            title="Edit Incident Scope"
                            className="bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 duration-150 p-2 rounded-lg border border-slate-200 cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            id={`row-delete-${c.id}`}
                            onClick={() => onDeleteCase(c.id)}
                            title="Decommission Case"
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-900 duration-150 p-2 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
