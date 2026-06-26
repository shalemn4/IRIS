<script lang="ts">
  import type { Evidence, TimelineEvent } from '../types';
  import { UploadCloud, Trash, HardDrive, Tag, Link2 } from 'lucide-svelte';

  // Svelte 5 props
  const { 
    caseId, 
    evidenceList = [], 
    caseEvents = [], 
    onUploadEvidence, 
    onRemoveEvidence 
  } = $props();

  let dragActive = $state(false);
  let evidenceTitle = $state("");
  let evidenceTag = $state("Evidence");
  let linkedEvent = $state("");
  let fileTypeError = $state("");

  function handleDrag(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      dragActive = true;
    } else if (e.type === "dragleave") {
      dragActive = false;
    }
  }

  function processRealUpload(fName: string, fType: string, fSize: number, content: string) {
    if (!fName) return;
    const computedTitle = evidenceTitle.trim() || fName;
    
    // Compute dynamic sizing label
    let sizeLabel = "1.2 KB";
    if (fSize > 1024 * 1024) {
      sizeLabel = (fSize / (1024 * 1024)).toFixed(1) + " MB";
    } else {
      sizeLabel = (fSize / 1024).toFixed(1) + " KB";
    }

    onUploadEvidence(computedTitle, fType || "text/plain", content, evidenceTag, linkedEvent || undefined);
    
    evidenceTitle = "";
    linkedEvent = "";
    fileTypeError = "";
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragActive = false;

    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const text = (loadEvent.target?.result as string) || "";
        processRealUpload(file.name, file.type, file.size, text);
      };
      reader.readAsText(file);
    }
  }

  function handleManualSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const text = (loadEvent.target?.result as string) || "";
        processRealUpload(file.name, file.type, file.size, text);
      };
      reader.readAsText(file);
    }
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between border-b border-slate-100 pb-2">
    <h4 class="text-[12px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1.5">
      <HardDrive class="h-4 w-4 text-violet-500" /> S3 Encrypted Evidence Locker
    </h4>
    <span class="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-bold">
      S3-SECURE
    </span>
  </div>

  <!-- Upload area -->
  <div
    id="evidence-dropzone"
    ondragenter={handleDrag}
    ondragover={handleDrag}
    ondragleave={handleDrag}
    ondrop={handleDrop}
    class="border-2 border-dashed rounded-xl p-4.5 text-center transition-all relative cursor-pointer {
      dragActive ? 'border-violet-600 bg-violet-50/50' : 'border-slate-200 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-300'
    }"
  >
    <input
      id="file-evidence-upload"
      type="file"
      class="absolute inset-0 opacity-0 cursor-pointer"
      onchange={handleManualSelect}
    />
    <UploadCloud class="h-7 w-7 text-slate-400 mx-auto mb-2" />
    <p class="text-[11.5px] font-bold text-slate-700">Drag items to secure locker, or click to browse</p>
    <p class="text-[10px] text-slate-400 mt-1">Accepts logs (.txt, .json), screenshots, and PDF indices</p>
  </div>

  <!-- Optional Metadata fields -->
  <div class="bg-zinc-100/50 p-3 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
    <div class="space-y-1">
      <label class="text-[10px] uppercase font-bold text-slate-400">Custom Title (Optional)</label>
      <input
        id="evidence-title-input"
        type="text"
        bind:value={evidenceTitle}
        placeholder="e.g. Domain Controller Logs"
        class="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
      />
    </div>
    <div class="space-y-1">
      <label class="text-[10px] uppercase font-bold text-slate-400">Categorization Tag</label>
      <select
        id="evidence-tag-select"
        bind:value={evidenceTag}
        class="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
      >
        <option value="Evidence">Evidence File</option>
        <option value="Indicators">IoC Indicators</option>
        <option value="Screenshots">Visual Screenshots</option>
        <option value="MemDumps">Memory dumps / SAM</option>
        <option value="PCAPs">Network Capture PCAPs</option>
      </select>
    </div>
    <div class="space-y-1 md:col-span-2">
      <label class="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
        <Link2 class="h-3 w-3 text-violet-500" /> Correlate Event Linkage (Optional)
      </label>
      <select
        id="evidence-event-link"
        bind:value={linkedEvent}
        class="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
      >
        <option value="">-- Associate with Event --</option>
        {#each caseEvents as e}
          <option value={e.id}>
            [{e.timestamp.substring(11, 16) || e.timestamp}] {e.event}
          </option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Locker List -->
  <div id="evidence-assets-list" class="space-y-2 max-h-56 overflow-y-auto pr-1">
    {#if evidenceList.length === 0}
      <div class="text-center py-6 text-slate-400 border border-slate-100 rounded-xl bg-white">
        <p class="text-[10.5px] font-semibold">Evidence locker is empty.</p>
        <p class="text-[9.5px] mt-0.5">Maintain indicators list for reporting inclusion.</p>
      </div>
    {:else}
      {#each evidenceList as e}
        <div
          class="bg-white p-3 rounded-xl border border-slate-200/80 flex items-start justify-between text-xs hover:border-slate-300 transition-colors"
        >
          <div class="space-y-1">
            <div class="flex items-center gap-1.5">
              <span class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[9.5px] font-extrabold border {
                e.tag === 'Indicators' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                e.tag === 'Screenshots' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                e.tag === 'MemDumps' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200'
              }">
                <Tag class="h-2 w-2" /> {e.tag}
              </span>
              <span class="text-[10.5px] font-bold text-slate-800 line-clamp-1">{e.title}</span>
            </div>
            <p class="text-[9.5px] text-slate-400 font-mono select-all truncate max-w-xs">{e.fileUrl}</p>
            
            {#if e.linkedEventId}
              <div class="inline-flex items-center gap-1 text-[9px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded border border-violet-100 mt-1">
                <Link2 class="h-2.5 w-2.5" /> Linked to timeline event
              </div>
            {/if}
          </div>

          <div class="flex items-center gap-1">
            <span class="text-[10.5px] font-mono text-slate-400 mr-1.5 font-bold">{e.size}</span>
            <button
              id="delete-ev-{e.id}"
              onclick={() => onRemoveEvidence(e.id)}
              title="Dump asset"
              class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer border-none bg-transparent"
            >
              <Trash class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
