<script lang="ts">
  import type { Case, CaseSeverity, CaseStatus } from '../types';
  import { 
    Plus, 
    Trash2, 
    Edit3, 
    CircleDot, 
    Eye, 
    Calendar, 
    ShieldAlert 
  } from 'lucide-svelte';

  // Svelte 5 props
  const { 
    cases = [], 
    onCreateCase, 
    onEditCase, 
    onDeleteCase, 
    onOpenCase 
  } = $props();

  // Local Svelte 5 state using $state
  let showCreateForm = $state(false);
  let newTitle = $state("");
  let newDesc = $state("");
  let newSeverity = $state<CaseSeverity>("Medium");
  let newStatus = $state<CaseStatus>("Open");

  let editingCaseId = $state<string | null>(null);
  let editTitle = $state("");
  let editDesc = $state("");
  let editSeverity = $state<CaseSeverity>("Medium");
  let editStatus = $state<CaseStatus>("Open");

  let statusFilter = $state<string>("All");
  let severityFilter = $state<string>("All");

  function handleCreateSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateCase(newTitle, newDesc, newSeverity, newStatus);
    newTitle = "";
    newDesc = "";
    newSeverity = "Medium";
    newStatus = "Open";
    showCreateForm = false;
  }

  function handleEditClick(c: Case) {
    editingCaseId = c.id;
    editTitle = c.title;
    editDesc = c.description;
    editSeverity = c.severity;
    editStatus = c.status;
  }

  function handleSaveEdit(e: SubmitEvent) {
    e.preventDefault();
    if (!editingCaseId || !editTitle.trim()) return;
    onEditCase(editingCaseId, {
      title: editTitle,
      description: editDesc,
      severity: editSeverity,
      status: editStatus,
    });
    editingCaseId = null;
  }

  // Filtered cases derived React-style
  const filteredCases = $derived(cases.filter((c) => {
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    const matchSeverity = severityFilter === "All" || c.severity === severityFilter;
    return matchStatus && matchSeverity;
  }));
</script>

<div id="cases-workspace-card" class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h2 class="text-lg font-bold text-slate-800">Incident Forensics Locker</h2>
      <p class="text-xs text-slate-500">Track and manage active security investigation workspaces</p>
    </div>
    <button
      id="btn-trigger-case-creator"
      onclick={() => {
        showCreateForm = !showCreateForm;
        editingCaseId = null;
      }}
      class="text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-4.5 py-2.5 shadow-sm shadow-violet-100 flex items-center justify-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
    >
      <Plus class="h-4 w-4" /> Log Security Incident
    </button>
  </div>

  <!-- Slideout Creator Panel -->
  {#if showCreateForm}
    <form
      id="case-creation-form"
      onsubmit={handleCreateSubmit}
      class="bg-white border border-violet-100/80 p-5 rounded-2xl shadow-sm space-y-4 max-w-2xl"
    >
      <h3 class="text-xs uppercase tracking-widest font-bold text-violet-700">Initialize New Dynamic Target Case</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Investigation Name / Incident Title</label>
          <input
            id="input-case-title"
            type="text"
            bind:value={newTitle}
            placeholder="e.g. Active Directory Hash Extraction WS-92"
            class="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white shadow-sm"
            required
          />
        </div>
        <div class="md:col-span-2">
          <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Core Description & Target Host</label>
          <textarea
            id="input-case-desc"
            bind:value={newDesc}
            placeholder="Enter scope of anomalous activity detected, targets affected..."
            class="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white shadow-sm h-20 resize-none"
          ></textarea>
        </div>
        <div>
          <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Severity Flag</label>
          <select
            id="select-case-severity"
            bind:value={newSeverity}
            class="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <div>
          <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Initial Status</label>
          <select
            id="select-case-status"
            bind:value={newStatus}
            class="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="Open">Open</option>
            <option value="Investigating">Investigating</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>
      <div class="flex items-center gap-2.5 pt-2">
        <button
          id="submit-case-btn"
          type="submit"
          class="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
        >
          Verify & Provision Case
        </button>
        <button
          type="button"
          onclick={() => showCreateForm = false}
          class="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs rounded-lg font-medium cursor-pointer"
        >
          Discard
        </button>
      </div>
    </form>
  {/if}

  <!-- Editing Dialog form Inline -->
  {#if editingCaseId}
    <form
      id="case-edit-form"
      onsubmit={handleSaveEdit}
      class="bg-white border border-amber-200/80 p-5 rounded-2xl shadow-sm space-y-4 max-w-2xl"
    >
      <h3 class="text-xs uppercase tracking-widest font-bold text-amber-700">Modify Investigation Scope: {editingCaseId}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Incident Title</label>
          <input
            id="edit-case-title"
            type="text"
            bind:value={editTitle}
            class="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white shadow-sm"
            required
          />
        </div>
        <div class="md:col-span-2">
          <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Incident Scope Description</label>
          <textarea
            id="edit-case-desc"
            bind:value={editDesc}
            class="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white shadow-sm h-20 resize-none"
          ></textarea>
        </div>
        <div>
          <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Severity Flag</label>
          <select
            id="edit-case-severity"
            bind:value={editSeverity}
            class="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-lg"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <div>
          <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Workflow Status</label>
          <select
            id="edit-case-status"
            bind:value={editStatus}
            class="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-lg"
          >
            <option value="Open">Open</option>
            <option value="Investigating">Investigating</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>
      <div class="flex items-center gap-2.5 pt-2">
        <button
          id="submit-edit-btn"
          type="submit"
          class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
        >
          Save Parameters
        </button>
        <button
          type="button"
          onclick={() => editingCaseId = null}
          class="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs rounded-lg font-medium cursor-pointer"
        >
          Cancel Edit
        </button>
      </div>
    </form>
  {/if}

  <!-- Filter Toolbar -->
  <div class="bg-white px-5 py-4.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
    <div class="flex items-center gap-2">
      <CircleDot class="h-4 w-4 text-violet-500" />
      <span>Filters:</span>
    </div>
    
    <div class="flex items-center gap-2">
      <span class="text-[11px] px-1 text-slate-400 font-bold uppercase">Status</span>
      <select
        id="filter-status-select"
        bind:value={statusFilter}
        class="border border-slate-200 bg-white shadow-sm rounded-lg px-2.5 py-1.5 focus:outline-none"
      >
        <option value="All">All Statuses</option>
        <option value="Open">Open</option>
        <option value="Investigating">Investigating</option>
        <option value="Resolved">Resolved</option>
      </select>
    </div>

    <div class="flex items-center gap-2">
      <span class="text-[11px] px-1 text-slate-400 font-bold uppercase">Severity</span>
      <select
        id="filter-severity-select"
        bind:value={severityFilter}
        class="border border-slate-200 bg-white shadow-sm rounded-lg px-2.5 py-1.5 focus:outline-none"
      >
        <option value="All">All Severities</option>
        <option value="Low">Low</option>
        <option value="Medium font-bold">Medium</option>
        <option value="High font-bold">High</option>
        <option value="Critical font-bold">Critical</option>
      </select>
    </div>

    <div class="ml-auto font-mono text-[10.5px] text-slate-400 font-medium whitespace-nowrap">
      Displaying {filteredCases.length} of {cases.length} Security Cases
    </div>
  </div>

  <!-- Cases Datatable List -->
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    {#if filteredCases.length === 0}
      <div class="p-12 text-center space-y-3">
        <div class="h-12 w-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <ShieldAlert class="h-5 w-5" />
        </div>
        <p class="text-xs font-bold text-slate-700">No active cases match search filters.</p>
        <p class="text-[11px] text-slate-400 max-w-sm mx-auto">Create a new container or change active selection guidelines to view indicators.</p>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="bg-zinc-50 border-b border-slate-200/80 text-slate-400 uppercase tracking-widest text-[9.5px] font-bold">
              <th class="py-3 px-4">Case ID</th>
              <th class="py-3 px-4">Incident Name & Host Targets</th>
              <th class="py-3 px-4 text-center">Threat Severity</th>
              <th class="py-3 px-4">Workflow status</th>
              <th class="py-3 px-4">Created Date</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredCases as c}
              <tr class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td class="py-4 px-4 font-mono font-bold text-slate-400">{c.id}</td>
                <td class="py-4 px-4">
                  <div class="font-bold text-slate-800 text-[13px]">{c.title}</div>
                  <p class="text-[11px] text-slate-600 mt-1 line-clamp-1 max-w-md">{c.description}</p>
                </td>
                <td class="py-4 px-4 text-center">
                  <span class="inline-block px-3 py-0.5 rounded text-[10.5px] font-bold tracking-tight border capitalize {
                    c.severity === 'Critical' ? 'bg-[#FED7AA] text-orange-950 border-orange-300 shadow-sm' :
                    c.severity === 'High' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                    c.severity === 'Medium' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }">
                    {c.severity}
                  </span>
                </td>
                <td class="py-4 px-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold {
                    c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    c.status === 'Investigating' ? 'bg-[#EDE9FE] text-violet-700 border border-violet-200/50' : 'bg-sky-50 text-sky-700 border border-sky-100'
                  }">
                    <span class="w-1.5 h-1.5 rounded-full {
                      c.status === 'Resolved' ? 'bg-emerald-500' :
                      c.status === 'Investigating' ? 'bg-violet-500 animate-pulse' : 'bg-sky-500'
                    }"></span>
                    {c.status}
                  </span>
                </td>
                <td class="py-4 px-4 text-slate-500 font-medium font-sans">
                  <div class="flex items-center gap-1">
                    <Calendar class="h-3.5 w-3.5 text-slate-400" />
                    {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td class="py-4 px-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      id="row-open-{c.id}"
                      onclick={() => onOpenCase(c.id)}
                      title="Open Investigation Workspace"
                      class="bg-violet-50 hover:bg-violet-100 text-violet-700 hover:text-violet-900 duration-150 p-2 rounded-lg cursor-pointer flex items-center justify-center border border-violet-200/40"
                    >
                      <Eye class="h-3.5 w-3.5" />
                    </button>
                    <button
                      id="row-edit-{c.id}"
                      onclick={() => handleEditClick(c)}
                      title="Edit Incident Scope"
                      class="bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 duration-150 p-2 rounded-lg border border-slate-200 cursor-pointer"
                    >
                      <Edit3 class="h-3.5 w-3.5" />
                    </button>
                    <button
                      id="row-delete-{c.id}"
                      onclick={() => onDeleteCase(c.id)}
                      title="Decommission Case"
                      class="bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-900 duration-150 p-2 rounded-lg cursor-pointer"
                    >
                      <Trash2 class="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
