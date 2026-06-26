<script lang="ts">
  import type { TimelineEvent } from '../types';
  import { Network, ArrowRight, BadgeInfo } from 'lucide-svelte';

  // Svelte 5 props
  const { events = [] } = $props();

  let selectedNodeId = $state<string | null>(null);

  // Take events and filter only suspicious/threat events, or chronological events (sorted by timestamp)
  const orderedChain = $derived([...events]
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .slice(0, 6) // Cap at 6 nodes for premium visual density
  );

  const selectedNode = $derived(
    orderedChain.find(n => n.id === selectedNodeId) || orderedChain[0]
  );
</script>

{#if orderedChain.length === 0}
  <div class="bg-white p-5 rounded-2xl border border-slate-200 text-center space-y-2">
    <Network class="h-6 w-6 text-slate-300 mx-auto" />
    <p class="text-xs font-bold text-slate-600">No attack nodes mapped yet.</p>
    <p class="text-[10px] text-slate-400 max-w-xs mx-auto">Upload forensic security logs inside the workspace to auto-extract step nodes.</p>
  </div>
{:else}
  <div id="attack-chain-visualizer" class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
          <Network class="h-4 w-4 text-violet-500 animate-pulse" /> Sandbox Attack Sequence Graph
        </h3>
        <h4 class="text-sm font-bold text-slate-800 mt-0.5">Chronological Intruder Propagation Node Map</h4>
      </div>
      <span class="text-[10px] font-mono font-bold bg-[#EDE9FE] text-violet-700 px-2 py-0.5 rounded border border-violet-200/50">
        Interactive Pipeline
      </span>
    </div>

    <!-- Connection pipeline nodes container -->
    <div class="overflow-x-auto pb-4 pt-2 -mx-2 px-2">
      <div class="flex items-center gap-3 min-w-[max-content]">
        {#each orderedChain as node, index}
          {@const isClickActive = selectedNodeId === node.id || (!selectedNodeId && index === 0)}
          {@const timeStr = node.timestamp.substring(11, 16) || node.timestamp.split("T").pop()?.substring(0, 5) || node.timestamp}

          <button
            id="node-chain-{node.id}"
            onclick={() => selectedNodeId = node.id}
            class="p-3.5 rounded-2xl border text-left cursor-pointer transition-all max-w-[160px] relative {
              isClickActive
                ? 'bg-violet-50 border-violet-300 shadow-md ring-2 ring-violet-500/20 scale-[1.03]'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
            }"
          >
            <span class="text-[9.5px] font-bold text-violet-500 font-mono tracking-wider block uppercase">
              {timeStr}
            </span>
            <span class="text-xs font-extrabold text-slate-800 line-clamp-1 mt-1 block">
              {node.event}
            </span>
            
            <!-- MITRE category tag mini -->
            {#if node.category}
              <span class="text-[8.5px] font-semibold text-slate-400 uppercase tracking-widest line-clamp-1 mt-1 block">
                {node.category}
              </span>
            {/if}

            <!-- Severity indicator badge -->
            <span class="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full {
              node.severity === 'Critical' ? 'bg-rose-500' :
              node.severity === 'High' ? 'bg-amber-500' :
              node.severity === 'Medium' ? 'bg-blue-500' : 'bg-slate-400'
            }"></span>
          </button>

          <!-- Draw connection line -->
          {#if index < orderedChain.length - 1}
            <ArrowRight class="h-4 w-4 text-slate-300 flex-shrink-0 animate-pulse" />
          {/if}
        {/each}
      </div>
    </div>

    <!-- Interactive context detail card -->
    {#if selectedNode}
      <div class="bg-zinc-50/60 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs shadow-inner">
        <div class="space-y-1 col-span-2">
          <span class="text-[10px] uppercase font-bold text-slate-400">Step Details</span>
          <p class="text-[12px] font-extrabold text-slate-800">{selectedNode.event}</p>
          <p class="text-slate-600 mt-1 max-w-xl leading-relaxed">{selectedNode.description}</p>
        </div>
        <div class="p-3 bg-white rounded-lg border border-slate-200 flex flex-col justify-between">
          <div class="space-y-1">
            <span class="text-[9.5px] uppercase font-bold text-slate-400 block tracking-widest">Incident Tactic</span>
            <span class="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border mt-1">
              <BadgeInfo class="h-3.5 w-3.5 text-violet-500" /> {selectedNode.category || "General Activity"}
            </span>
          </div>
          
          <!-- MITRE mapping indicator -->
          {#if selectedNode.techniqueId}
            <div class="border-t border-slate-100 pt-2 mt-2">
              <span class="text-[8.5px] font-mono font-bold text-slate-400">MITRE TECHNIQUE</span>
              <span class="block text-violet-700 font-extrabold text-[10.5px] mt-0.5 font-mono select-all uppercase">
                {selectedNode.techniqueId}: {selectedNode.techniqueName}
              </span>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
{/if}
