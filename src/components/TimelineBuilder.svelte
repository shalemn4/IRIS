<script lang="ts">
  import type { TimelineEvent, CaseSeverity } from '../types';
  import { 
    Plus, 
    ArrowUp, 
    ArrowDown, 
    Trash, 
    ShieldEllipsis, 
    Filter, 
    ChevronsUpDown, 
    StickyNote 
  } from 'lucide-svelte';

  // Svelte 5 props
  const { 
    caseId, 
    events = [], 
    onAddTimelineEvent, 
    onDeleteTimelineEvent, 
    onReorderTimeline 
  } = $props();

  // Local state
  let sevFilter = $state<string>("All");
  let reverseOrder = $state(false);

  let showAddForm = $state(false);
  let customTimestamp = $state("12:00 PM");
  let customEvent = $state("");
  let customDesc = $state("");
  let customSev = $state<CaseSeverity>("Medium");
  let customCat = $state("Discovery");
  let customMitreId = $state("");
  let customMitreName = $state("");

  let bindingNotesEventId = $state<string | null>(null);
  let activeNotesText = $state("");

  function handleShiftUp(index: number) {
    if (index === 0) return;
    const copied = [...processedEvents];
    const originalTargetIndex = events.findIndex(e => e.id === copied[index].id);
    const originalPrevIndex = events.findIndex(e => e.id === copied[index - 1].id);
    if (originalTargetIndex === -1 || originalPrevIndex === -1) return;

    const fullList = [...events];
    const target = fullList[originalTargetIndex];
    fullList[originalTargetIndex] = fullList[originalPrevIndex];
    fullList[originalPrevIndex] = target;
    onReorderTimeline(fullList);
  }

  function handleShiftDown(index: number) {
    if (index === processedEvents.length - 1) return;
    const copied = [...processedEvents];
    const originalTargetIndex = events.findIndex(e => e.id === copied[index].id);
    const originalNextIndex = events.findIndex(e => e.id === copied[index + 1].id);
    if (originalTargetIndex === -1 || originalNextIndex === -1) return;

    const fullList = [...events];
    const target = fullList[originalTargetIndex];
    fullList[originalTargetIndex] = fullList[originalNextIndex];
    fullList[originalNextIndex] = target;
    onReorderTimeline(fullList);
  }

  function handleAddSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!customEvent.trim() || !customDesc.trim()) return;

    const nowIso = new Date().toISOString().split("T")[0];
    const fullTimeMatchStr = customTimestamp.includes(":") ? `${nowIso}T${customTimestamp.trim()}` : new Date().toISOString();

    onAddTimelineEvent({
      timestamp: fullTimeMatchStr.length > 19 ? fullTimeMatchStr.substring(0, 19) : fullTimeMatchStr,
      event: customEvent,
      description: customDesc,
      severity: customSev,
      category: customCat,
      techniqueId: customMitreId || undefined,
      techniqueName: customMitreName || undefined,
    });

    customEvent = "";
    customDesc = "";
    customSev = "Medium";
    customMitreId = "";
    customMitreName = "";
    showAddForm = false;
  }

  function handleSaveEventNotes(evtId: string) {
    const updated = events.map(e => {
      if (e.id === evtId) {
        return { ...e, notes: activeNotesText };
      }
      return e;
    });
    onReorderTimeline(updated);
    bindingNotesEventId = null;
    activeNotesText = "";
  }

  // Reactivity in Svelte 5 for filtering and sorting
  const processedEvents = $derived.by(() => {
    let filtered = [...events];
    if (sevFilter !== "All") {
      filtered = filtered.filter(e => e.severity === sevFilter);
    }
    filtered.sort((a, b) => {
      const comp = a.timestamp.localeCompare(b.timestamp);
      return reverseOrder ? -comp : comp;
    });
    return filtered;
  });
</script>

<div id="timeline-builder-card" class="space-y-4">
  <!-- Header tool panel -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3.5 gap-2.5">
    <div>
      <h3 class="text-xs uppercase font-extrabold tracking-wider text-slate-400">Forensics Analysis</h3>
      <h4 class="text-sm font-bold text-slate-800">Chronological Event Timeline Builder</h4>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <!-- Severity filter block -->
      <div class="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-sm">
        <Filter class="h-3 w-3 text-slate-400" />
        <select
          id="timeline-severity-filter-select"
          bind:value={sevFilter}
          class="text-[10.5px] font-bold text-slate-600 bg-transparent focus:outline-none cursor-pointer border-none"
        >
          <option value="All">All Alarms</option>
          <option value="Critical">Critical Only</option>
          <option value="High">High Only</option>
          <option value="Medium">Medium Only</option>
          <option value="Low">Low Only</option>
        </select>
      </div>

      <button
        id="toggle-sort-order"
        onclick={() => reverseOrder = !reverseOrder}
        class="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
      >
        <ChevronsUpDown class="h-3 w-3" />
        {reverseOrder ? "Latest First" : "Earliest First"}
      </button>

      <button
        id="btn-add-timeline-event"
        onclick={() => showAddForm = !showAddForm}
        class="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
      >
        <Plus class="h-3 w-3" /> Insert Entry
      </button>
    </div>
  </div>

  <!-- Add Timeline Event compact form -->
  {#if showAddForm}
    <form
      id="add-event-form"
      onsubmit={handleAddSubmit}
      class="bg-white border border-violet-100 p-4.5 rounded-2xl shadow-sm space-y-3.5 max-w-xl"
    >
      <h5 class="text-[11px] uppercase tracking-wider font-extrabold text-violet-700">Add Log Sequence Item</h5>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div class="space-y-1">
          <label class="text-[10px] uppercase font-bold text-slate-400">Time (Timestamp / Hour)</label>
          <input
            id="event-time-input"
            type="text"
            bind:value={customTimestamp}
            placeholder="e.g. 09:12 AM"
            class="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white shadow-sm rounded-lg"
            required
          />
        </div>
        <div class="space-y-1 sm:col-span-2">
          <label class="text-[10px] uppercase font-bold text-slate-400">Activity Event Summary</label>
          <input
            id="event-title-input"
            type="text"
            bind:value={customEvent}
            placeholder="e.g. Host Privilege Escalation Execution"
            class="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white shadow-sm rounded-lg"
            required
          />
        </div>
        <div class="sm:col-span-3 space-y-1">
          <label class="text-[10px] uppercase font-bold text-slate-400">Raw Description / Context Logs</label>
          <textarea
            id="event-desc-input"
            bind:value={customDesc}
            placeholder="Describe details found in firewall headers or process dumps..."
            class="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white shadow-sm rounded-lg h-16 resize-none"
            required
          ></textarea>
        </div>
        <div class="space-y-1">
          <label class="text-[10px] uppercase font-bold text-slate-400">Threat Severity</label>
          <select
            id="event-sev-select"
            bind:value={customSev}
            class="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <div class="space-y-1">
          <label class="text-[10px] uppercase font-bold text-slate-400">MITRE Category</label>
          <input
            id="event-cat-input"
            type="text"
            bind:value={customCat}
            placeholder="Discovery / Command and Control"
            class="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white shadow-sm rounded-lg"
          />
        </div>
        <div class="space-y-1">
          <label class="text-[10px] uppercase font-bold text-slate-400">MITRE Technique ID</label>
          <input
            id="event-mitre-id-input"
            type="text"
            bind:value={customMitreId}
            placeholder="e.g. T1059.001"
            class="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white shadow-sm rounded-lg"
          />
        </div>
      </div>
      <div class="flex items-center gap-2 pt-1 text-[10.5px] font-bold">
        <button
          id="btn-add-event-submit"
          type="submit"
          class="px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg cursor-pointer"
        >
          Verify & Add Node
        </button>
        <button
          type="button"
          onclick={() => showAddForm = false}
          class="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  {/if}

  <!-- Main Core interactive list timeline cards -->
  <div id="timeline-list" class="space-y-3">
    {#if processedEvents.length === 0}
      <div class="p-12 text-center bg-white border border-slate-200 rounded-2xl">
        <ShieldEllipsis class="h-8 w-8 text-slate-300 mx-auto mb-2" />
        <p class="text-xs font-bold text-slate-700">No chronological timeline logs aligned.</p>
        <p class="text-[10px] text-slate-400 mt-1">Select standard logs files or inject sandbox components to rebuild sequences.</p>
      </div>
    {:else}
      {#each processedEvents as node, index}
        {@const timeOnly = node.timestamp.includes("T") ? node.timestamp.split("T")[1].substring(0, 5) : node.timestamp}
        {@const fullDate = node.timestamp.includes("T") ? node.timestamp.split("T")[0] : ""}
        {@const isSuspicious = node.isSuspicious || node.severity === "High" || node.severity === "Critical"}
        
        <div
          id="timeline-node-card-{node.id}"
          class="bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all relative {
            isSuspicious ? 'border-rose-150 bg-white/95' : 'border-slate-200'
          }"
        >
          <div class="flex items-start gap-4 justify-between">
            <!-- Left Side timing line & icon badge -->
            <div class="flex flex-col items-center">
              <span class="font-mono text-[10.5px] font-bold bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded shadow-inner whitespace-nowrap">
                {timeOnly}
              </span>
              {#if fullDate}
                <span class="text-[9px] text-slate-400 mt-1 font-mono">{fullDate}</span>
              {/if}
              
              <!-- Visual Connection Shifter arrows (Drag & Drop replacement inside iframe) -->
              <div class="flex flex-col items-center gap-1.5 mt-4 text-slate-400">
                <button
                  onclick={() => handleShiftUp(index)}
                  disabled={index === 0}
                  title="Shift up in timeline"
                  class="p-1 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 rounded cursor-pointer"
                >
                  <ArrowUp class="h-3.5 w-3.5" />
                </button>
                <button
                  onclick={() => handleShiftDown(index)}
                  disabled={index === processedEvents.length - 1}
                  title="Shift down in timeline"
                  class="p-1 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 rounded cursor-pointer"
                >
                  <ArrowDown class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <!-- Main Event Data Body -->
            <div class="flex-1 space-y-1 pt-0.5">
              <div class="flex items-center flex-wrap gap-2">
                <span class="text-[13px] font-bold text-slate-800 font-sans">
                  {node.event}
                </span>
                
                <!-- Severity badge -->
                <span class="px-2 py-0.5 rounded text-[9px] font-extrabold border uppercase tracking-tight {
                  node.severity === 'Critical' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                  node.severity === 'High' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                  node.severity === 'Medium' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                }">
                  {node.severity}
                </span>

                <!-- Suspicious/Compliance warning highlight of Right vs Wrong -->
                {#if isSuspicious}
                  <span class="flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-200">
                    ✖ WRONG / THREAT ALARM
                  </span>
                {:else}
                  <span class="flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-200">
                    ✔ RIGHT / SAFE OPERATION
                  </span>
                {/if}

                <!-- MITRE Category badge -->
                {#if node.category}
                  <span class="text-[9.5px] font-extrabold uppercase font-mono tracking-widest text-[#6B7280] ml-auto">
                    {node.category}
                  </span>
                {/if}
              </div>

              <p class="text-xs text-slate-600 leading-relaxed font-sans">{node.description}</p>

              <!-- MITRE technique subtitle tag -->
              {#if node.techniqueId}
                <div class="pt-1 select-all">
                  <span class="text-[9px] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded">
                    MITRE ATT&CK {node.techniqueId}: {node.techniqueName}
                  </span>
                </div>
              {/if}

              <!-- analyst inline custom note display -->
              {#if node.notes}
                <div class="bg-[#EDE9FE]/40 p-2.5 border-l-2 border-violet-600 rounded text-xs mt-2 text-violet-950 font-sans italic space-y-1">
                  <span class="text-[9px] text-violet-700 uppercase font-bold not-italic tracking-widest block">Analyst Attachment Notes:</span>
                  <span>"{node.notes}"</span>
                  <button
                    onclick={() => {
                      bindingNotesEventId = node.id;
                      activeNotesText = node.notes || "";
                    }}
                    class="text-[9px] text-[#A78BFA] hover:text-[#7C3AED] hover:underline font-bold not-italic block mt-1 cursor-pointer border-none bg-transparent p-0"
                  >
                    Modify text notes
                  </button>
                </div>
              {:else}
                <button
                  onclick={() => {
                    bindingNotesEventId = node.id;
                    activeNotesText = "";
                  }}
                  class="text-[9.5px] text-slate-400 hover:text-violet-600 hover:underline flex items-center gap-1 font-bold mt-2 cursor-pointer pb-1 border-none bg-transparent p-0"
                >
                  ➕ Attach analyst indicator note
                </button>
              {/if}

              <!-- Inline note binding form editor drawer -->
              {#if bindingNotesEventId === node.id}
                <div class="bg-slate-50 border border-slate-200 p-2.5 rounded-xl space-y-2 mt-2">
                  <label class="block text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">Write Event Attachment (e.g. hash validation or host status)</label>
                  <textarea
                    bind:value={activeNotesText}
                    placeholder="e.g. VM Workstation isolated at 11:15 AM following this confirmation alert."
                    class="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg h-12"
                  ></textarea>
                  <div class="flex items-center gap-2 text-[10px] font-bold">
                    <button
                      type="button"
                      onclick={() => handleSaveEventNotes(node.id)}
                      class="bg-violet-600 text-white px-2.5 py-1 rounded hover:bg-violet-700 cursor-pointer border-none"
                    >
                      Save Note
                    </button>
                    <button
                      type="button"
                      onclick={() => bindingNotesEventId = null}
                      class="bg-slate-200 text-slate-600 px-2.5 py-1 rounded hover:bg-slate-300 cursor-pointer border-none"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              {/if}
            </div>

            <!-- Dump timeline row button -->
            <div class="flex items-center self-start">
              <button
                id="delete-timeline-row-{node.id}"
                onclick={() => onDeleteTimelineEvent(node.id)}
                title="Dump alert event"
                class="text-slate-300 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer border-none bg-transparent"
              >
                <Trash class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
