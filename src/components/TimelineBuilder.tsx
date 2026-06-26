import React, { useState } from "react";
import { TimelineEvent, CaseSeverity } from "../types";
import { 
  Plus, ArrowUp, ArrowDown, HelpCircle, 
  Trash, AlertCircle, ShieldEllipsis, Filter, 
  ChevronsUpDown, Check, StickyNote 
} from "lucide-react";

interface TimelineBuilderProps {
  caseId: string;
  events: TimelineEvent[];
  onAddTimelineEvent: (eventData: Partial<TimelineEvent>) => void;
  onDeleteTimelineEvent: (eventId: string) => void;
  onReorderTimeline: (reordered: TimelineEvent[]) => void;
}

export default function TimelineBuilder({
  caseId,
  events,
  onAddTimelineEvent,
  onDeleteTimelineEvent,
  onReorderTimeline,
}: TimelineBuilderProps) {
  // Filters
  const [sevFilter, setSevFilter] = useState<string>("All");
  const [reverseOrder, setReverseOrder] = useState(false);

  // Quick custom event form inputs
  const [showAddForm, setShowAddForm] = useState(false);
  const [customTimestamp, setCustomTimestamp] = useState("12:00 PM");
  const [customEvent, setCustomEvent] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customSev, setCustomSev] = useState<CaseSeverity>("Medium");
  const [customCat, setCustomCat] = useState("Discovery");
  const [customMitreId, setCustomMitreId] = useState("");
  const [customMitreName, setCustomMitreName] = useState("");

  // Target event editing for inline note bindings
  const [bindingNotesEventId, setBindingNotesEventId] = useState<string | null>(null);
  const [activeNotesText, setActiveNotesText] = useState("");

  // Handle shift UP order
  const handleShiftUp = (index: number) => {
    if (index === 0) return;
    const copied = [...events];
    const target = copied[index];
    copied[index] = copied[index - 1];
    copied[index - 1] = target;
    onReorderTimeline(copied);
  };

  // Handle shift DOWN order
  const handleShiftDown = (index: number) => {
    if (index === events.length - 1) return;
    const copied = [...events];
    const target = copied[index];
    copied[index] = copied[index + 1];
    copied[index + 1] = target;
    onReorderTimeline(copied);
  };

  // Adding Custom Event trigger
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEvent.trim() || !customDesc.trim()) return;

    // Convert local time "12:00 PM" or timestamp strings cleanly
    const nowIso = new Date().toISOString().split("T")[0];
    const fullTimeMatchStr = customTimestamp.includes(":") ? `${nowIso}T${customTimestamp.trim()}` : new Date().toISOString();

    onAddTimelineEvent({
      timestamp: fullTimeMatchStr.length > 19 ? fullTimeMatchStr.substr(0, 19) : fullTimeMatchStr,
      event: customEvent,
      description: customDesc,
      severity: customSev,
      category: customCat,
      techniqueId: customMitreId || undefined,
      techniqueName: customMitreName || undefined,
    });

    // Clear inputs
    setCustomEvent("");
    setCustomDesc("");
    setCustomSev("Medium");
    setCustomMitreId("");
    setCustomMitreName("");
    setShowAddForm(false);
  };

  // Bind custom notes locally to an event
  const handleSaveEventNotes = (evtId: string) => {
    const updated = events.map(e => {
      if (e.id === evtId) {
        return { ...e, notes: activeNotesText };
      }
      return e;
    });
    onReorderTimeline(updated);
    setBindingNotesEventId(null);
    setActiveNotesText("");
  };

  // Sort and filter events safely
  let processedEvents = [...events];
  if (sevFilter !== "All") {
    processedEvents = processedEvents.filter(e => e.severity === sevFilter);
  }

  // Sort chronological order (Ascending default, support toggling descending)
  processedEvents.sort((a, b) => {
    const comp = a.timestamp.localeCompare(b.timestamp);
    return reverseOrder ? -comp : comp;
  });

  return (
    <div id="timeline-builder-card" className="space-y-4">
      {/* Header tool panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3.5 gap-2.5">
        <div>
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Forensics Analysis</h3>
          <h4 className="text-sm font-bold text-slate-800">Chronological Event Timeline Builder</h4>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Severity filter block */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-sm">
            <Filter className="h-3 w-3 text-slate-400" />
            <select
              id="timeline-severity-filter-select"
              value={sevFilter}
              onChange={(e) => setSevFilter(e.target.value)}
              className="text-[10.5px] font-bold text-slate-600 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="All">All Alarms</option>
              <option value="Critical">Critical Only</option>
              <option value="High">High Only</option>
              <option value="Medium font-bold">Medium Only</option>
              <option value="Low font-bold">Low Only</option>
            </select>
          </div>

          <button
            id="toggle-sort-order"
            onClick={() => setReverseOrder(!reverseOrder)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
          >
            <ChevronsUpDown className="h-3 w-3" />
            {reverseOrder ? "Latest First" : "Earliest First"}
          </button>

          <button
            id="btn-add-timeline-event"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
          >
            <Plus className="h-3 w-3" /> Insert Entry
          </button>
        </div>
      </div>

      {/* Add Timeline Event compact form */}
      {showAddForm && (
        <form
          id="add-event-form"
          onSubmit={handleAddSubmit}
          className="bg-white border border-violet-100 p-4.5 rounded-2xl shadow-sm space-y-3.5 max-w-xl"
        >
          <h5 className="text-[11px] uppercase tracking-wider font-extrabold text-violet-700">Add Log Sequence Item</h5>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Time (Timestamp / Hour)</label>
              <input
                id="event-time-input"
                type="text"
                value={customTimestamp}
                onChange={(e) => setCustomTimestamp(e.target.value)}
                placeholder="e.g. 09:12 AM"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white shadow-sm rounded-lg"
                required
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] uppercase font-bold text-slate-400">Activity Event Summary</label>
              <input
                id="event-title-input"
                type="text"
                value={customEvent}
                onChange={(e) => setCustomEvent(e.target.value)}
                placeholder="e.g. Host Privilege Escalation Execution"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white shadow-sm rounded-lg"
                required
              />
            </div>
            <div className="sm:col-span-3 space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Raw Description / Context Logs</label>
              <textarea
                id="event-desc-input"
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="Describe details found in firewall headers or process dumps..."
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white shadow-sm rounded-lg h-16 resize-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Threat Severity</label>
              <select
                id="event-sev-select"
                value={customSev}
                onChange={(e) => setCustomSev(e.target.value as CaseSeverity)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">MITRE Category</label>
              <input
                id="event-cat-input"
                type="text"
                value={customCat}
                onChange={(e) => setCustomCat(e.target.value)}
                placeholder="Discovery / Command and Control"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white shadow-sm rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">MITRE Technique ID</label>
              <input
                id="event-mitre-id-input"
                type="text"
                value={customMitreId}
                onChange={(e) => setCustomMitreId(e.target.value)}
                placeholder="e.g. T1059.001"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white shadow-sm rounded-lg"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1 text-[10.5px] font-bold">
            <button
              id="btn-add-event-submit"
              type="submit"
              className="px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg cursor-pointer"
            >
              Verify & Add Node
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Main Core interactive list timeline cards */}
      <div id="timeline-list" className="space-y-3">
        {processedEvents.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
            <ShieldEllipsis className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No chronological timeline logs aligned.</p>
            <p className="text-[10px] text-slate-400 mt-1">Select standard logs files or inject sandbox components to rebuild sequences.</p>
          </div>
        ) : (
          processedEvents.map((node, index) => {
            const timeOnly = node.timestamp.includes("T") ? node.timestamp.split("T")[1].substr(0, 5) : node.timestamp;
            const fullDate = node.timestamp.includes("T") ? node.timestamp.split("T")[0] : "";
            const isSuspicious = node.isSuspicious || node.severity === "High" || node.severity === "Critical";

            return (
              <div
                key={node.id}
                id={`timeline-node-card-${node.id}`}
                className={`bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all relative ${
                  isSuspicious ? "border-rose-150 bg-white/95" : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-4 justify-between">
                  {/* Left Side timing line & icon badge */}
                  <div className="flex flex-col items-center">
                    <span className="font-mono text-[10.5px] font-bold bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded shadow-inner whitespace-nowrap">
                      {timeOnly}
                    </span>
                    {fullDate && <span className="text-[9px] text-slate-400 mt-1 font-mono">{fullDate}</span>}
                    
                    {/* Visual Connection Shifter arrows (Drag & Drop replacement inside iframe) */}
                    <div className="flex flex-col items-center gap-1.5 mt-4 text-slate-400">
                      <button
                        onClick={() => handleShiftUp(index)}
                        disabled={index === 0}
                        title="Shift up in timeline"
                        className="p-1 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 rounded cursor-pointer"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleShiftDown(index)}
                        disabled={index === events.length - 1}
                        title="Shift down in timeline"
                        className="p-1 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 rounded cursor-pointer"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Main Event Data Body */}
                  <div className="flex-1 space-y-1 pt-0.5">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-[13px] font-bold text-slate-800 font-sans">
                        {node.event}
                      </span>
                      
                      {/* Severity badge */}
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border uppercase tracking-tight ${
                        node.severity === "Critical" ? "bg-rose-50 text-rose-600 border-rose-200" :
                        node.severity === "High" ? "bg-amber-50 text-amber-600 border-amber-200" :
                        node.severity === "Medium" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}>
                        {node.severity}
                      </span>

                      {/* Suspicious/Compliance warning highlight of Right vs Wrong */}
                      {isSuspicious ? (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-200">
                          ✖ WRONG / THREAT ALARM
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-200">
                          ✔ RIGHT / SAFE OPERATION
                        </span>
                      )}

                      {/* MITRE Category badge */}
                      {node.category && (
                        <span className="text-[9.5px] font-extrabold uppercase font-mono tracking-widest text-[#6B7280] ml-auto">
                          {node.category}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-sans">{node.description}</p>

                    {/* MITRE technique subtitle tag */}
                    {node.techniqueId && (
                      <div className="pt-1 select-all">
                        <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded">
                          MITRE ATT&CK {node.techniqueId}: {node.techniqueName}
                        </span>
                      </div>
                    )}

                    {/* analyst inline custom note display */}
                    {node.notes ? (
                      <div className="bg-[#EDE9FE]/40 p-2.5 border-l-2 border-violet-600 rounded text-xs mt-2 text-violet-950 font-sans italic space-y-1">
                        <span className="text-[9px] text-violet-700 uppercase font-bold not-italic tracking-widest block">Analyst Attachment Notes:</span>
                        <span>"{node.notes}"</span>
                        <button
                          onClick={() => {
                            setBindingNotesEventId(node.id);
                            setActiveNotesText(node.notes || "");
                          }}
                          className="text-[9px] text-[#A78BFA] hover:text-[#7C3AED] hover:underline font-bold not-italic block mt-1 cursor-pointer"
                        >
                          Modify text notes
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setBindingNotesEventId(node.id);
                          setActiveNotesText("");
                        }}
                        className="text-[9.5px] text-slate-400 hover:text-violet-600 hover:underline flex items-center gap-1 font-bold mt-2 cursor-pointer pb-1"
                      >
                        <StickyNote className="h-3 w-3" /> Attach analyst indicator note
                      </button>
                    )}

                    {/* Inline note binding form editor drawer */}
                    {bindingNotesEventId === node.id && (
                      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl space-y-2 mt-2">
                        <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">Write Event Attachment (e.g. hash validation or host status)</label>
                        <textarea
                          value={activeNotesText}
                          onChange={(e) => setActiveNotesText(e.target.value)}
                          placeholder="e.g. VM Workstation isolated at 11:15 AM following this confirmation alert."
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg h-12"
                        />
                        <div className="flex items-center gap-2 text-[10px] font-bold">
                          <button
                            type="button"
                            onClick={() => handleSaveEventNotes(node.id)}
                            className="bg-violet-600 text-white px-2.5 py-1 rounded hover:bg-violet-700 cursor-pointer"
                          >
                            Save Note
                          </button>
                          <button
                            type="button"
                            onClick={() => setBindingNotesEventId(null)}
                            className="bg-slate-200 text-slate-600 px-2.5 py-1 rounded hover:bg-slate-300 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dump timeline row button */}
                  <div className="flex items-center self-start">
                    <button
                      id={`delete-timeline-row-${node.id}`}
                      onClick={() => onDeleteTimelineEvent(node.id)}
                      title="Dump alert event"
                      className="text-slate-300 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
