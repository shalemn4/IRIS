import React, { useState } from "react";
import { Case, TimelineEvent, Finding, Evidence } from "../types";
import { FileText, Copy, Printer, Check, Cpu, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";

interface ReportSystemProps {
  caseId: string;
  activeCase: Case;
  caseEvents: TimelineEvent[];
  caseFindings: Finding[];
  caseEvidence: Evidence[];
}

export default function ReportSystem({
  caseId,
  activeCase,
  caseEvents,
  caseFindings,
  caseEvidence,
}: ReportSystemProps) {
  const [reportMarkdown, setReportMarkdown] = useState("");
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGenerateReport = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/report/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ caseId }),
      });

      if (!res.ok) {
        throw new Error("Failed to communicate with executive server. Response status code error.");
      }

      const data = await res.json();
      setReportMarkdown(data.report);
      setIsAiGenerated(data.isAiGenerated);
    } catch (err: any) {
      setErrorMsg("Failed to connect to the automatic intelligence summary builder. Please verify backend connection status.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!reportMarkdown) return;
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="investigation-reporting-card" className="space-y-4">
      {/* Tool header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Forensics Release</h3>
          <h4 className="text-sm font-bold text-slate-800">CISO Incident Executive Report Generator</h4>
        </div>
        
        {/* Actions panel */}
        <div className="flex items-center gap-1.5">
          {reportMarkdown && (
            <>
              <button
                id="btn-report-copy"
                onClick={handleCopy}
                title="Copy markdown block"
                className="p-1.5 hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy MD"}
              </button>
              <button
                id="btn-report-print"
                onClick={handlePrint}
                title="Print layout"
                className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Printer className="h-3.5 w-3.5" /> Print
              </button>
            </>
          )}

          <button
            id="btn-generate-comprehensive-report"
            onClick={handleGenerateReport}
            disabled={loading}
            className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-violet-100"
          >
            {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Cpu className="h-3.5 w-3.5" />}
            {loading ? "Rebuilding briefing..." : "Draft Executive Report"}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border-l-2 border-red-500 rounded text-red-900 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" /> {errorMsg}
        </div>
      )}

      {/* Main core report print view area */}
      {reportMarkdown ? (
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200/50 text-[10.5px] font-bold">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            {isAiGenerated 
              ? "Comprehensive briefing compiled dynamically via server-side Gemini 3.5 AI APIs." 
              : "Executive summary assembled from active case data tables and rules heuristics."
            }
          </div>

          <div 
            id="report-printable-area" 
            className="p-6 border border-slate-250 bg-white rounded-2xl shadow-inner max-h-[460px] overflow-y-auto font-sans leading-relaxed text-xs text-slate-800 select-text"
          >
            <div className="border-b border-double border-slate-300 pb-4 mb-6 flex justify-between items-start text-[11px] text-slate-500 uppercase tracking-widest font-mono">
              <div>
                <p className="font-extrabold text-slate-800 text-base leading-none">IRIS FORENSICS BRIEFING</p>
                <p className="mt-1">Incident Record // Identifier: {caseId}</p>
                <p>Status: {activeCase.status} // Severity: {activeCase.severity}</p>
              </div>
              <div className="text-right">
                <p>Date: {new Date().toLocaleDateString()}</p>
                <p>System Agent Node: CLOUD-S3</p>
              </div>
            </div>

            {/* Markdown parsing block representation */}
            <div className="space-y-4 text-slate-700">
              {reportMarkdown.split("\n").map((line, idx) => {
                if (line.startsWith("### ")) {
                  return <h3 key={idx} className="text-[13.5px] font-extrabold text-slate-900 border-b border-slate-200 pb-1.5 mt-5 mb-2 font-sans uppercase tracking-tight">{line.replace("### ", "")}</h3>;
                }
                if (line.startsWith("## ")) {
                  return <h2 key={idx} className="text-sm font-extrabold text-slate-900 mt-4 mb-2 font-sans">{line.replace("## ", "")}</h2>;
                }
                if (line.startsWith("# ")) {
                  return <h1 key={idx} className="text-base font-extrabold text-[#111827] mt-5 mb-3 font-sans">{line.replace("# ", "")}</h1>;
                }
                
                let processedLine: React.ReactNode = line;
                if (line.startsWith("* ")) {
                  processedLine = line.replace("* ", "");
                  
                  // Bold checking nested
                  if (processedLine.toString().includes("**")) {
                    const parts = processedLine.toString().split("**");
                    processedLine = parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-bold text-slate-900">{part}</strong> : part);
                  }
                  return <li key={idx} className="ml-4 list-disc text-xs text-slate-600 leading-relaxed my-1">{processedLine}</li>;
                }

                if (line.includes("**")) {
                  const parts = line.split("**");
                  processedLine = parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-bold text-slate-900">{part}</strong> : part);
                }

                return <p key={idx} className="min-h-[1rem] hover:text-slate-950 duration-100">{processedLine}</p>;
              })}
            </div>

            {/* S3 Evidence references lists at end */}
            <div className="mt-8 border-t border-slate-200 pt-5 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 select-none">Enclosed Locker Forensic Signatures ({caseEvidence.length} items)</span>
              {caseEvidence.map(e => (
                <div key={e.id} className="text-[10px] font-mono text-slate-500 bg-slate-50 p-2 rounded flex items-center justify-between border border-slate-150">
                  <span>📎 {e.title} // Tag: {e.tag}</span>
                  <span className="text-slate-400">{e.fileUrl}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center text-[10px] text-slate-400 select-none font-mono">
              *** END OF SECURITY OPERATION BRIEFING SYSTEM REPORT ***
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-4">
          <div className="h-10 w-10 bg-violet-50 text-violet-600 rounded-full flex items-center justify-center mx-auto">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">Audit Documentation Ready to Draft</p>
            <p className="text-[10px] text-slate-400 max-w-sm mx-auto mt-1">
              Select Draft Executive Report to trigger server-side aggregation pipelines, generating standard intelligence drafts with MITRE maps.
            </p>
          </div>
          <button
            id="btn-report-draft-cta"
            onClick={handleGenerateReport}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Draft Report Checklist
          </button>
        </div>
      )}
    </div>
  );
}
