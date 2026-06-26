import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import CasesPage from "./components/CasesPage";
import EvidenceLocker from "./components/EvidenceLocker";
import NotesEditor from "./components/NotesEditor";
import AttackChain from "./components/AttackChain";
import TimelineBuilder from "./components/TimelineBuilder";
import ReportSystem from "./components/ReportSystem";
import { Case, TimelineEvent, Finding, Evidence, CaseNote, CaseSeverity, CaseStatus } from "./types";
import { 
  Shield, FolderKanban, ClipboardList, 
  Settings, LogOut, Upload, Plus, Sparkles, FolderLock, 
  HelpCircle, Eye, AlertCircle, CheckCircle, Network, HardDrive, FileText, ChevronRight,
  RefreshCw,
  UploadCloud, X, Activity, Check, Lock, Info
} from "lucide-react";

export default function App() {
  const [currentView, setCurrentView] = useState<"landing" | "app">("landing");
  const [appTab, setAppTab] = useState<"dashboard" | "cases" | "workspace">("dashboard");
  const [workspaceSubTab, setWorkspaceSubTab] = useState<"timeline" | "report">("timeline");

  // State management
  const [cases, setCases] = useState<Case[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string>("case-demo-01");
  const [activeCaseDetails, setActiveCaseDetails] = useState<{
    id: string;
    title: string;
    description: string;
    severity: CaseSeverity;
    status: CaseStatus;
    events: TimelineEvent[];
    evidence: Evidence[];
    findings: Finding[];
    notes: CaseNote;
  } | null>(null);

  const [loadingCases, setLoadingCases] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "info" | "warn"; text: string } | null>(null);
  const [interactiveLogText, setInteractiveLogText] = useState("");

  const [ingestionTab, setIngestionTab] = useState<"upload" | "paste">("upload");
  const [uploadDragActive, setUploadDragActive] = useState(false);
  const [lastParsedReport, setLastParsedReport] = useState<{
    fileName: string;
    totalLines: number;
    threatsCount: number;
    compliantCount: number;
    events: any[];
  } | null>(null);

  // Trigger temporary visual toasts
  const triggerToast = (text: string, type: "success" | "info" | "warn" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // 1. Fetch case lists
  const fetchCasesList = async () => {
    setLoadingCases(true);
    try {
      const res = await fetch("/api/cases");
      if (res.ok) {
        const data = await res.json();
        setCases(data);
      }
    } catch (err) {
      console.error("Error fetching case lists", err);
    } finally {
      setLoadingCases(false);
    }
  };

  // 2. Fetch specific case details (including child timeline events, findings, notes, evidence)
  const fetchCaseDetails = async (id: string) => {
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/cases/${id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveCaseDetails(data);
      }
    } catch (err) {
      console.error("Error fetching case details", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Fetch initial case catalogs
  useEffect(() => {
    fetchCasesList();
  }, []);

  // Hot sync current details whenever active case shifts
  useEffect(() => {
    if (activeCaseId) {
      fetchCaseDetails(activeCaseId);
    }
  }, [activeCaseId]);

  // Handle case switching from selector dropdowns
  const handleCaseSelect = (id: string) => {
    setActiveCaseId(id);
    triggerToast(`Switched active investigation workspace to ${id}`, "info");
  };

  // Load the standard active Active-workstation compromise demo immediately
  const handleLoadDemoCase = () => {
    setCurrentView("app");
    setAppTab("workspace");
    setWorkspaceSubTab("timeline");
    setActiveCaseId("case-demo-01");
    triggerToast("Loaded demonstration Case file Operation Frostbite. Forensics matrices parsed, S3 locker populated.", "success");
  };

  // 3. Create a custom incident
  const handleCreateCase = async (title: string, description: string, severity: CaseSeverity, status: CaseStatus) => {
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, severity, status }),
      });
      if (res.ok) {
        const newCase = await res.json();
        triggerToast(`Incident Case ${newCase.id} created successfully!`, "success");
        await fetchCasesList();
        setActiveCaseId(newCase.id);
        setAppTab("workspace");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to initialize security case", "warn");
    }
  };

  // 4. Update case status / characteristics
  const handleEditCase = async (id: string, updates: Partial<Case>) => {
    try {
      const res = await fetch(`/api/cases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        triggerToast("Incident details updated successfully", "success");
        await fetchCasesList();
        if (activeCaseId === id) {
          fetchCaseDetails(id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Delete specific Case
  const handleDeleteCase = async (id: string) => {
    if (!window.confirm("Are you absolutely sure you want to decommission this investigation case? All related timelines, notes, and evidence in S3 will be permanently deleted.")) {
      return;
    }
    try {
      const res = await fetch(`/api/cases/${id}`, { method: "DELETE" });
      if (res.ok) {
        triggerToast("Case records deleted cleanly from database pools", "success");
        await fetchCasesList();
        // Fall back to demo case or first active item
        if (activeCaseId === id) {
          setActiveCaseId("case-demo-01");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 6. Append single Timeline Entry
  const handleAddTimelineEvent = async (eventData: Partial<TimelineEvent>) => {
    try {
      const res = await fetch(`/api/timeline/${activeCaseId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
      if (res.ok) {
        triggerToast("Custom event mapped into chronologic sequence", "success");
        fetchCaseDetails(activeCaseId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Remove single Timeline Entry
  const handleDeleteTimelineEvent = async (eventId: string) => {
    try {
      const res = await fetch(`/api/timeline/${activeCaseId}/events/${eventId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        triggerToast("Timeline node discarded", "info");
        fetchCaseDetails(activeCaseId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 8. Reorder active timeline sequence
  const handleReorderTimeline = async (reorderedEvents: TimelineEvent[]) => {
    // Optimistic UI updates
    setActiveCaseDetails((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        events: reorderedEvents,
      };
    });

    try {
      const res = await fetch(`/api/timeline/${activeCaseId}/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reorderedEvents }),
      });
      if (!res.ok) {
        throw new Error("Reorder failed on database pools");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to preserve custom chronological sequence", "warn");
      fetchCaseDetails(activeCaseId); // Revert sync
    }
  };

  // 9. Upload Evidence directly to lockers
  const handleUploadEvidence = async (title: string, fileType: string, fileContent: string, tag: string, linkedEventId?: string) => {
    try {
      const res = await fetch("/api/evidence/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: activeCaseId,
          title,
          fileType,
          fileContent,
          tag,
          linkedEventId,
        }),
      });
      if (res.ok) {
        triggerToast("Forensic asset uploaded securely mirror to AWS S3 Locker buckets", "success");
        fetchCaseDetails(activeCaseId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 10. Empty evidence item
  const handleRemoveEvidence = async (evId: string) => {
    try {
      const res = await fetch(`/api/evidence/${activeCaseId}/${evId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        triggerToast("Forensic evidence asset discarded cleanly", "info");
        fetchCaseDetails(activeCaseId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 11. Auto-save written notes
  const handleSaveNotes = async (content: string) => {
    try {
      const res = await fetch(`/api/notes/${activeCaseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        // Quietly update active state cache
        setActiveCaseDetails((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            notes: {
              ...prev.notes,
              content,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 12. Sandbox Log Ingestion handler
  const handleQuickInject = async (logType: string) => {
    let mockContent = "";
    let fName = "security_isolated_syslog.txt";

    if (logType === "bruteforce") {
      fName = "active_directory_bruteforce.txt";
      mockContent = `
        22:15:01 AD_AUTH_FAILURE IP=198.51.100.12 user=administrator - reason="bad password"
        22:15:03 AD_AUTH_FAILURE IP=198.51.100.12 user=administrator - reason="bad password"
        22:15:04 AD_AUTH_FAILURE IP=198.51.100.12 user=administrator - reason="bad password"
        22:15:07 AD_AUTH_FAILURE IP=198.51.100.12 user=administrator - reason="bad password"
        22:15:09 AD_AUTH_FAILURE IP=198.51.100.12 user=administrator - reason="bad password"
        22:15:10 AD_AUTH_FAILURE IP=198.51.100.12 user=administrator - reason="bad password"
      `.trim();
    } else if (logType === "ransomware") {
      fName = "firewall_endpoint_alerts.json";
      mockContent = JSON.stringify([
        {
          timestamp: new Date().toISOString().substr(0,19),
          event: "Suspicious Remote Download",
          description: "Wget trigger detected downloading payload from attacker.xyz/trojan_pack.exe",
          severity: "High",
          category: "Command and Control"
        },
        {
          timestamp: new Date(Date.now() + 100000).toISOString().substr(0,19),
          event: "Trojan Executable Downloaded",
          description: "Malicious binary trojan_pack.exe unpacked in local temp user registry.",
          severity: "Critical",
          category: "Execution"
        }
      ], null, 2);
    }

    try {
      const res = await fetch("/api/logs/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: activeCaseId,
          fileName: fName,
          fileContent: mockContent,
          fileType: fName.endsWith(".json") ? "json" : "txt"
        }),
      });

      if (res.ok) {
        const data = await res.json();
        triggerToast(data.message, "success");
        fetchCaseDetails(activeCaseId);
      }
    } catch (err) {
      console.error(err);
      triggerToast("Log Injection failed on server interface", "warn");
    }
  };

  // manual typing text log ingestion submitter
  const handleManualLogIngestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interactiveLogText.trim()) return;

    try {
      const res = await fetch("/api/logs/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: activeCaseId,
          fileName: "forensics_analyst_pasted_lines.txt",
          fileContent: interactiveLogText,
          fileType: "txt",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const threats = data.events?.filter((ev: any) => ev.isSuspicious) || [];
        const compliant = data.events?.filter((ev: any) => !ev.isSuspicious) || [];
        setLastParsedReport({
          fileName: "forensics_analyst_pasted_lines.txt",
          totalLines: (data.events?.length || 0),
          threatsCount: threats.length,
          compliantCount: compliant.length,
          events: data.events || []
        });
        triggerToast(`Manual paste processed successfully. Enrolled ${data.events?.length || 0} event milestones!`, "success");
        setInteractiveLogText("");
        fetchCaseDetails(activeCaseId);
      }
    } catch (err) {
      console.error(err);
      triggerToast("Manual text parse operation failed.", "warn");
    }
  };

  const handleLogFileUpload = async (fileName: string, content: string) => {
    if (!content.trim()) return;
    try {
      const res = await fetch("/api/logs/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: activeCaseId,
          fileName,
          fileContent: content,
          fileType: fileName.endsWith(".json") ? "json" : "txt"
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const threats = data.events?.filter((ev: any) => ev.isSuspicious) || [];
        const compliant = data.events?.filter((ev: any) => !ev.isSuspicious) || [];
        setLastParsedReport({
          fileName,
          totalLines: (data.events?.length || 0),
          threatsCount: threats.length,
          compliantCount: compliant.length,
          events: data.events || []
        });
        triggerToast(`Log file "${fileName}" processed successfully.`, "success");
        fetchCaseDetails(activeCaseId);
      } else {
        triggerToast("Failed to process the uploaded file.", "warn");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Network error uploading log file.", "warn");
    }
  };

  // Render main portal view
  if (currentView === "landing") {
    return <LandingPage onStart={() => setCurrentView("app")} onLoadDemo={handleLoadDemoCase} />;
  }

  const activeCaseObj = cases.find(c => c.id === activeCaseId) || cases[0];

  return (
    <div className="min-h-screen bg-zinc-50/50 font-sans text-slate-800 flex flex-col antialiased select-none">
      
      {/* Toast Notice bar */}
      {toastMessage && (
        <div id="iris-global-toast" className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-lg border text-xs font-semibold max-w-sm flex items-center gap-3 transition-all duration-300 transform translate-y-0 pulse-soft ${
          toastMessage.type === "success" ? "bg-emerald-50 text-emerald-950 border-emerald-200" :
          toastMessage.type === "warn" ? "bg-red-50 text-red-950 border-red-200" : "bg-violet-50 text-violet-950 border-violet-200"
        }`}>
          {toastMessage.type === "success" && <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />}
          {toastMessage.type === "warn" && <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />}
          {toastMessage.type === "info" && <Sparkles className="h-4 w-4 text-violet-600 flex-shrink-0" />}
          <p>{toastMessage.text}</p>
        </div>
      )}

      {/* Primary header navbar */}
      <header id="app-header" className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          {/* Logo visual launcher */}
          <button 
            id="logo-brand-btn"
            onClick={() => setCurrentView("landing")}
            className="flex items-center gap-2 text-left hover:opacity-85 transition-opacity cursor-pointer"
          >
            <div className="h-8.5 w-8.5 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow shadow-violet-200 font-bold text-sm">
              <Shield className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="font-sans font-extrabold text-slate-900 tracking-tight text-sm block">IRIS Incident Studio</span>
              <span className="text-[10px] text-slate-400 font-bold block leading-none font-mono">SOC OPERATION NODE</span>
            </div>
          </button>
          
          <ChevronRight className="h-4 w-4 text-slate-300 hidden sm:inline" />

          {/* Active Case switching dropdown selector */}
          {cases.length > 0 && (
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase hidden md:inline">InScope:</span>
              <select
                id="header-case-picker"
                value={activeCaseId}
                onChange={(e) => handleCaseSelect(e.target.value)}
                className="border border-slate-250 bg-white text-xs font-bold text-slate-700 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer max-w-xs truncate shadow-sm"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.id.substr(5, 4).toUpperCase()}] {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Core application navigation selectors */}
        <div className="flex items-center gap-1 bg-slate-100/85 rounded-xl p-1 border border-slate-250/50 text-xs font-semibold">
          <button
            id="tab-dashboard-select"
            onClick={() => setAppTab("dashboard")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
              appTab === "dashboard" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            📊 Security Dashboard
          </button>
          <button
            id="tab-cases-select"
            onClick={() => setAppTab("cases")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
              appTab === "cases" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            💼 Incidents Locker
          </button>
          <button
            id="tab-workspace-select"
            onClick={() => setAppTab("workspace")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
              appTab === "workspace" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            🔍 Investigation Workspace
          </button>
        </div>

        {/* Signout back to portal helper */}
        <div className="flex items-center gap-4">
          <button
            id="btn-return-portal"
            onClick={() => {
              setCurrentView("landing");
              triggerToast("Returned cleanly to main studio portal.", "info");
            }}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 bg-slate-50 border border-slate-200 hover:border-slate-300 duration-150 px-3 py-1.5 rounded-lg cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" /> Portal Intro
          </button>
        </div>
      </header>

      {/* Main body rendering container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 select-text overflow-y-auto">
        {loadingCases ? (
          <div className="p-24 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="h-8 w-8 animate-spin text-violet-600" />
            <p className="text-xs font-bold text-slate-600">Retrieving security case channels...</p>
          </div>
        ) : (
          <>
            {/* View Tab: Dashboard */}
            {appTab === "dashboard" && (
              <Dashboard
                cases={cases}
                events={activeCaseDetails?.events || []}
                findings={activeCaseDetails?.findings || []}
                evidence={activeCaseDetails?.evidence || []}
                onQuickInject={handleQuickInject}
                onNavigateToCase={(caseId) => {
                  setActiveCaseId(caseId);
                  setAppTab("workspace");
                  setWorkspaceSubTab("timeline");
                }}
                onCreateCase={() => setAppTab("cases")}
              />
            )}

            {/* View Tab: Cases Management List */}
            {appTab === "cases" && (
              <CasesPage
                cases={cases}
                onCreateCase={handleCreateCase}
                onEditCase={handleEditCase}
                onDeleteCase={handleDeleteCase}
                onOpenCase={(caseId) => {
                  setActiveCaseId(caseId);
                  setAppTab("workspace");
                  setWorkspaceSubTab("timeline");
                }}
              />
            )}

            {/* View Tab: Investigation Workspace (Complex split layout) */}
            {appTab === "workspace" && activeCaseDetails && (
              <div id="investigation-split-workspace" className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                
                {/* Left side parameters segment (Case Info, S3 locker evidence, ATT&CK visual) */}
                <div className="xl:col-span-1 space-y-6">
                  
                  {/* Case parameters card */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">ACTIVE SECURITY AUDIT // ID: {activeCaseDetails.id}</span>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">{activeCaseDetails.title}</h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{activeCaseDetails.description}</p>
                    </div>

                    <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Threat Level</span>
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          activeCaseDetails.severity === "Critical" ? "bg-rose-50 text-rose-600 border-rose-150" :
                          activeCaseDetails.severity === "High" ? "bg-amber-50 text-amber-600 border-amber-150" :
                          activeCaseDetails.severity === "Medium" ? "bg-blue-50 text-blue-600 border-blue-150" : "bg-slate-50 text-slate-600 border-slate-150"
                        }`}>
                          {activeCaseDetails.severity}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5 font-sans">Investigation status</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          activeCaseDetails.status === "Resolved" ? "bg-emerald-50 text-emerald-700 border-emerald-150" :
                          activeCaseDetails.status === "Investigating" ? "bg-violet-50 text-violet-700 border-violet-150" : "bg-sky-50 text-sky-700 border-sky-150"
                        }`}>
                          • {activeCaseDetails.status}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Modify Investigation parameters</label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <select
                          id="workspace-change-severity"
                          value={activeCaseDetails.severity}
                          onChange={(e) => handleEditCase(activeCaseDetails.id, { severity: e.target.value as CaseSeverity })}
                          className="border border-slate-200 bg-white rounded-lg p-1"
                        >
                          <option value="Low">Low Threat</option>
                          <option value="Medium">Medium Threat</option>
                          <option value="High">High Threat</option>
                          <option value="Critical">Critical Threat</option>
                        </select>
                        <select
                          id="workspace-change-status"
                          value={activeCaseDetails.status}
                          onChange={(e) => handleEditCase(activeCaseDetails.id, { status: e.target.value as CaseStatus })}
                          className="border border-slate-200 bg-white rounded-lg p-1"
                        >
                          <option value="Open">Status: Open</option>
                          <option value="Investigating">Status: Investigating</option>
                          <option value="Resolved">Status: Resolved</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Evidence locker component */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <EvidenceLocker
                      caseId={activeCaseId}
                      evidenceList={activeCaseDetails.evidence || []}
                      caseEvents={activeCaseDetails.events || []}
                      onUploadEvidence={handleUploadEvidence}
                      onRemoveEvidence={handleRemoveEvidence}
                    />
                  </div>

                </div>

                {/* Center Panel (Timeline and Reporting builder tabs) */}
                <div className="xl:col-span-2 space-y-6">
                  
                  {/* Attack sequence interactive visual block */}
                  <AttackChain events={activeCaseDetails.events || []} />

                  {/* Core Timeline parser / Report toggler */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex bg-slate-150/70 p-1 rounded-xl border border-slate-200 max-w-[max-content] text-xs font-semibold">
                      <button
                        id="sub-tab-timeline-select"
                        onClick={() => setWorkspaceSubTab("timeline")}
                        className={`px-4.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                          workspaceSubTab === "timeline" ? "bg-white text-slate-800 shadow-sm font-bold" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        <ClipboardList className="h-3.5 w-3.5" /> Investigation Steps
                      </button>
                      <button
                        id="sub-tab-report-select"
                        onClick={() => setWorkspaceSubTab("report")}
                        className={`px-4.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                          workspaceSubTab === "report" ? "bg-white text-slate-800 shadow-sm font-bold" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        <FileText className="h-3.5 w-3.5" /> Intelligence Report
                      </button>
                    </div>

                    {workspaceSubTab === "timeline" ? (
                      <div className="space-y-6">
                        
                        {/* Interactive drag or manual log files parses with Real-time Right vs Wrong forensics */}
                        <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 shadow-inner space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-violet-700 tracking-wider block">SOC Log Ingestion & Analytics Terminal</span>
                              <span className="text-[12.5px] font-extrabold text-slate-800 block mt-0.5">Evaluate Custom Logs (Secure vs Insecure)</span>
                            </div>
                            <div className="flex bg-zinc-200/50 p-0.5 rounded-lg text-[10.5px] font-bold">
                              <button
                                type="button"
                                onClick={() => setIngestionTab("upload")}
                                className={`px-2.5 py-1 rounded-md transition-all ${
                                  ingestionTab === "upload" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                                }`}
                              >
                                📁 Upload File
                              </button>
                              <button
                                type="button"
                                onClick={() => setIngestionTab("paste")}
                                className={`px-2.5 py-1 rounded-md transition-all ${
                                  ingestionTab === "paste" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                                }`}
                              >
                                ✍️ Paste Text
                              </button>
                            </div>
                          </div>

                          {ingestionTab === "upload" ? (
                            <div
                              id="log-dropzone"
                              onDragOver={(e) => {
                                e.preventDefault();
                                setUploadDragActive(true);
                              }}
                              onDragLeave={() => setUploadDragActive(false)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setUploadDragActive(false);
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                  const file = e.dataTransfer.files[0];
                                  const reader = new FileReader();
                                  reader.onload = (evt) => {
                                    handleLogFileUpload(file.name, (evt.target?.result as string) || "");
                                  };
                                  reader.readAsText(file);
                                }
                              }}
                              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all relative cursor-pointer ${
                                uploadDragActive ? "border-violet-600 bg-violet-50/50" : "border-zinc-200 bg-white hover:bg-slate-50 hover:border-zinc-300"
                              }`}
                            >
                              <input
                                id="log-file-input"
                                type="file"
                                accept=".txt,.log,.json,.csv"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    const reader = new FileReader();
                                    reader.onload = (evt) => {
                                      handleLogFileUpload(file.name, (evt.target?.result as string) || "");
                                    };
                                    reader.readAsText(file);
                                  }
                                }}
                              />
                              <UploadCloud className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                              <p className="text-xs font-bold text-slate-700">Drag your log file here, or click to browse</p>
                              <p className="text-[10px] text-slate-400 mt-1">Accepts standard .txt, .log, .json, and .csv data sheets</p>
                            </div>
                          ) : (
                            <form onSubmit={handleManualLogIngestSubmit} className="space-y-3">
                              <textarea
                                id="log-pasted-strings-input"
                                value={interactiveLogText}
                                onChange={(e) => setInteractiveLogText(e.target.value)}
                                placeholder="Example:&#10;2026-06-22T14:45:00 USER_LOGIN_SUCCESS j.admin IP=10.12.5.40 - MFA verified (authorized check)&#10;2026-06-22T14:47:11 POWERSHELL ExecutionPolicy Bypass -enc SQBFAFg..."
                                className="w-full text-[11px] font-mono p-3 border border-zinc-200 bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 h-24 resize-none leading-relaxed"
                              />
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-400 max-w-xs leading-tight">Paste logs to run server-side forensics check. Results stream instantly below.</span>
                                <button
                                  id="btn-manual-log-parse-submit"
                                  type="submit"
                                  className="px-4.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                                >
                                  Identify Milestones
                                </button>
                              </div>
                            </form>
                          )}

                          {/* Beautiful Forensics Analytics Verdict Report Card (What went Right vs Wrong) */}
                          {lastParsedReport && (
                            <div className="bg-white border border-zinc-200 p-4.5 rounded-xl space-y-4 shadow-sm">
                              <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full font-bold">
                                      Forensic Check Complete
                                    </span>
                                    <span className="text-[11px] font-mono text-slate-500 font-semibold truncate max-w-[150px]">
                                      {lastParsedReport.fileName}
                                    </span>
                                  </div>
                                  <p className="text-[11.5px] font-mono text-slate-400">Processed {lastParsedReport.totalLines} custom sequence records.</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setLastParsedReport(null)}
                                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                                  title="Dismiss Report"
                                >
                                  <X className="h-4.5 w-4.5" />
                                </button>
                              </div>

                              {/* Risk metrics dial summary */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* WHAT WENT RIGHT (Green Card) */}
                                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <div className="h-5.5 w-5.5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 text-xs font-bold">✓</div>
                                      <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">What Went Right</span>
                                    </div>
                                    <span className="text-[11px] font-mono bg-emerald-100/60 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                                      {lastParsedReport.compliantCount} Verified Safe
                                    </span>
                                  </div>
                                  <p className="text-[10.5px] text-emerald-800 leading-relaxed">
                                    The following actions match secure system baselines, policy-compliant logins, and general standard system operations:
                                  </p>
                                  <div className="space-y-1.5 max-h-40 overflow-y-auto font-mono text-[9px] pr-1">
                                    {lastParsedReport.events.filter(e => !e.isSuspicious).length === 0 ? (
                                      <p className="text-slate-400 italic py-1">No compliant actions extracted in log segment.</p>
                                    ) : (
                                      lastParsedReport.events.filter(e => !e.isSuspicious).map((e, idx) => (
                                        <div key={idx} className="bg-white/80 p-1.5 rounded border border-emerald-100 text-emerald-900 leading-tight">
                                          <div className="font-bold flex justify-between">
                                            <span>[RIGHT] {e.event}</span>
                                            <span className="text-[8px] text-slate-400">{(e.timestamp || "").substr(11, 8)}</span>
                                          </div>
                                          <p className="text-[8.5px] mt-0.5 text-slate-600 line-clamp-2">{e.description}</p>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>

                                {/* WHAT WENT WRONG (Red Card) */}
                                <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3.5 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <div className="h-5.5 w-5.5 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 text-xs font-bold">✖</div>
                                      <span className="text-xs font-extrabold text-rose-950 uppercase tracking-wider">What Went Wrong</span>
                                    </div>
                                    <span className="text-[11px] font-mono bg-rose-100/60 text-rose-800 border border-rose-200 px-2 py-0.5 rounded font-bold">
                                      {lastParsedReport.threatsCount} Alerts Flagged
                                    </span>
                                  </div>
                                  <p className="text-[10.5px] text-rose-800 leading-relaxed">
                                    These activities triggered high-severity alarms, suspicious command flags, credential dump checks, or data leak patterns:
                                  </p>
                                  <div className="space-y-1.5 max-h-40 overflow-y-auto font-mono text-[9px] pr-1">
                                    {lastParsedReport.events.filter(e => e.isSuspicious).length === 0 ? (
                                      <p className="text-emerald-700 italic py-1 font-semibold">✔ Congratulations, zero threat vectors flagged from this source file!</p>
                                    ) : (
                                      lastParsedReport.events.filter(e => e.isSuspicious).map((e, idx) => (
                                        <div key={idx} className="bg-white/90 p-1.5 rounded border border-rose-100 text-rose-900 leading-tight">
                                          <div className="font-bold flex justify-between text-rose-800">
                                            <span>[WRONG] {e.event}</span>
                                            <span className="text-[8px] text-slate-400">{(e.timestamp || "").substr(11, 8)}</span>
                                          </div>
                                          <p className="text-[8.5px] mt-0.5 text-slate-600 line-clamp-2">{e.description}</p>
                                          {e.techniqueId && (
                                            <span className="inline-block mt-1 text-[7.5px] px-1 py-0.2 bg-red-50 text-red-700 rounded border border-red-200">
                                              MITRE: {e.techniqueId} - {e.techniqueName}
                                            </span>
                                          )}
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <TimelineBuilder
                          caseId={activeCaseId}
                          events={activeCaseDetails.events || []}
                          onAddTimelineEvent={handleAddTimelineEvent}
                          onDeleteTimelineEvent={handleDeleteTimelineEvent}
                          onReorderTimeline={handleReorderTimeline}
                        />
                      </div>
                    ) : (
                      <ReportSystem
                        caseId={activeCaseId}
                        activeCase={activeCaseDetails}
                        caseEvents={activeCaseDetails.events || []}
                        caseFindings={activeCaseDetails.findings || []}
                        caseEvidence={activeCaseDetails.evidence || []}
                      />
                    )}
                  </div>

                </div>

                {/* Right Panel (Notepad editor and Auto-findings report) */}
                <div className="xl:col-span-1 space-y-6">
                  
                  {/* Notes template editor */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <NotesEditor
                      caseId={activeCaseId}
                      notes={activeCaseDetails.notes}
                      caseEvents={activeCaseDetails.events || []}
                      onSaveNotes={handleSaveNotes}
                    />
                  </div>

                  {/* Real-time Findings audit widget */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="border-b border-slate-100 pb-2">
                      <h4 className="text-[12px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1.5">
                        🛡️ Real-Time Findings Engine
                      </h4>
                      <p className="text-[10px] text-slate-400 inline mt-1 block leading-relaxed">
                        Automatic heuristic scan identifies threat patterns internally during log uploads.
                      </p>
                    </div>

                    <div id="findings-checklist" className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {activeCaseDetails.findings.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 border border-slate-100 rounded-xl bg-slate-50/50">
                          <p className="text-[10.5px] font-semibold">Heuristics scan complete. Zero alerts triggered.</p>
                          <p className="text-[9.5px] text-slate-400 mt-0.5">Heuristics evaluate terms such as 'powershell', 'exfil', 'failed'.</p>
                        </div>
                      ) : (
                        activeCaseDetails.findings.map((f) => (
                          <div
                            key={f.id}
                            className="bg-zinc-50 p-3 rounded-xl border border-slate-250 flex items-start gap-2.5 text-xs hover:border-slate-350 transition-colors"
                          >
                            <div className="h-5.5 w-5.5 bg-rose-50 text-rose-600 rounded flex items-center justify-center font-extrabold flex-shrink-0 text-[10px] mt-0.5 border border-rose-100">
                              ⚠️
                            </div>
                            <div className="space-y-1 flex-1">
                              <p className="font-bold text-slate-800 leading-tight">{f.title}</p>
                              <p className="text-[10.5px] text-slate-600 leading-relaxed font-sans">{f.description}</p>
                              
                              <p className="text-[10px] text-amber-700 italic leading-relaxed pt-0.5">Reason: {f.reason}</p>
                              
                              <div className="flex items-center gap-1.5 pt-1.5 font-mono text-[9.5px] font-bold text-slate-500">
                                <span>Confidence: {f.confidence}%</span>
                                <span>•</span>
                                <span className="text-rose-600 uppercase uppercase">{f.severity}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
