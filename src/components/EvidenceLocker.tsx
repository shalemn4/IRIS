import React, { useState } from "react";
import { Evidence, TimelineEvent } from "../types";
import { UploadCloud, Trash, HardDrive, Tag, Link2, Download, AlertCircle } from "lucide-react";

interface EvidenceLockerProps {
  caseId: string;
  evidenceList: Evidence[];
  caseEvents: TimelineEvent[];
  onUploadEvidence: (title: string, fileType: string, fileContent: string, tag: string, linkedEventId?: string) => void;
  onRemoveEvidence: (evidenceId: string) => void;
}

export default function EvidenceLocker({
  caseId,
  evidenceList,
  caseEvents,
  onUploadEvidence,
  onRemoveEvidence,
}: EvidenceLockerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [evidenceTitle, setEvidenceTitle] = useState("");
  const [evidenceTag, setEvidenceTag] = useState("Evidence");
  const [linkedEvent, setLinkedEvent] = useState("");
  const [fileTypeError, setFileTypeError] = useState("");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processRealUpload = (fName: string, fType: string, fSize: number, content: string) => {
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
    
    // Clear states
    setEvidenceTitle("");
    setLinkedEvent("");
    setFileTypeError("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const text = (loadEvent.target?.result as string) || "";
        processRealUpload(file.name, file.type, file.size, text);
      };
      reader.readAsText(file);
    }
  };

  const handleManualSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const text = (loadEvent.target?.result as string) || "";
        processRealUpload(file.name, file.type, file.size, text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h4 className="text-[12px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1.5">
          <HardDrive className="h-4 w-4 text-violet-500" /> S3 Encrypted Evidence Locker
        </h4>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-bold">
          S3-SECURE
        </span>
      </div>

      {/* Upload area */}
      <div
        id="evidence-dropzone"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-4.5 text-center transition-all relative cursor-pointer ${
          dragActive ? "border-violet-600 bg-violet-50/50" : "border-slate-200 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-300"
        }`}
      >
        <input
          id="file-evidence-upload"
          type="file"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={handleManualSelect}
        />
        <UploadCloud className="h-7 w-7 text-slate-400 mx-auto mb-2" />
        <p className="text-[11.5px] font-bold text-slate-700">Drag items to secure locker, or click to browse</p>
        <p className="text-[10px] text-slate-400 mt-1">Accepts logs (.txt, .json), screenshots, and PDF indices</p>
      </div>

      {/* Optional Metadata fields */}
      <div className="bg-zinc-100/50 p-3 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400">Custom Title (Optional)</label>
          <input
            id="evidence-title-input"
            type="text"
            value={evidenceTitle}
            onChange={(e) => setEvidenceTitle(e.target.value)}
            placeholder="e.g. Domain Controller Logs"
            className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400">Categorization Tag</label>
          <select
            id="evidence-tag-select"
            value={evidenceTag}
            onChange={(e) => setEvidenceTag(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
          >
            <option value="Evidence">Evidence File</option>
            <option value="Indicators">IoC Indicators</option>
            <option value="Screenshots">Visual Screenshots</option>
            <option value="MemDumps">Memory dumps / SAM</option>
            <option value="PCAPs">Network Capture PCAPs</option>
          </select>
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Link2 className="h-3 w-3 text-violet-500" /> Correlate Event Linkage (Optional)
          </label>
          <select
            id="evidence-event-link"
            value={linkedEvent}
            onChange={(e) => setLinkedEvent(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
          >
            <option value="">-- Associate with Event --</option>
            {caseEvents.map((e) => (
              <option key={e.id} value={e.id}>
                [{e.timestamp.substr(11,5) || e.timestamp}] {e.event}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Locker List */}
      <div id="evidence-assets-list" className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {evidenceList.length === 0 ? (
          <div className="text-center py-6 text-slate-400 border border-slate-100 rounded-xl bg-white">
            <p className="text-[10.5px] font-semibold">Evidence locker is empty.</p>
            <p className="text-[9.5px] mt-0.5">Maintain indicators list for reporting inclusion.</p>
          </div>
        ) : (
          evidenceList.map((e) => {
            const isImage = e.type.startsWith("image/");
            return (
              <div
                key={e.id}
                className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-start justify-between text-xs hover:border-slate-300 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[9.5px] font-extrabold border ${
                      e.tag === "Indicators" ? "bg-amber-50 text-amber-600 border-amber-200" :
                      e.tag === "Screenshots" ? "bg-purple-50 text-purple-600 border-purple-200" :
                      e.tag === "MemDumps" ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}>
                      <Tag className="h-2 w-2" /> {e.tag}
                    </span>
                    <span className="text-[10.5px] font-bold text-slate-800 line-clamp-1">{e.title}</span>
                  </div>
                  <p className="text-[9.5px] text-slate-400 font-mono select-all truncate max-w-xs">{e.fileUrl}</p>
                  
                  {e.linkedEventId && (
                    <div className="inline-flex items-center gap-1 text-[9px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded border border-violet-100 mt-1">
                      <Link2 className="h-2.5 w-2.5" /> Linked to timeline event
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[10.5px] font-mono text-slate-400 mr-1.5 font-bold">{e.size}</span>
                  <button
                    id={`delete-ev-${e.id}`}
                    onClick={() => onRemoveEvidence(e.id)}
                    title="Dump asset"
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
