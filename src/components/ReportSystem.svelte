<script lang="ts">
  import type { Case, TimelineEvent, Finding, Evidence } from '../types';
  import { 
    FileText, 
    Copy, 
    Printer, 
    Check, 
    Cpu, 
    RefreshCw, 
    AlertTriangle, 
    ShieldCheck 
  } from 'lucide-svelte';

  // Svelte 5 props
  const { 
    caseId, 
    activeCase, 
    caseEvents = [], 
    caseFindings = [], 
    caseEvidence = [], 
    isStaticMode 
  } = $props();

  let reportMarkdown = $state("");
  let isAiGenerated = $state(false);
  let loading = $state(false);
  let copied = $state(false);
  let errorMsg = $state("");

  function generateStaticReportMarkdown() {
    if (!activeCase) return "";
    return `# INCIDENT FORENSIC REPORT: ${activeCase.title.toUpperCase()}
  
## 1. EXECUTIVE SUMMARY
**Incident Case ID:** ${activeCase.id}
**Severity Level:** ${activeCase.severity}
**Current Incident Status:** ${activeCase.status}
**Report Generation Timestamp:** ${new Date().toISOString()}

**Description of Incident:**
${activeCase.description}

This report compiles chronological timeline evidence and findings regarding ${activeCase.title}. Under static review, we have recorded **${caseEvents.length} system milestones** and mapped relevant indicators against the MITRE ATT&CK enterprise catalog.

---

## 2. KEY THREAT FINDINGS
${caseFindings.length === 0 ? "*No automatic findings recorded.*" : caseFindings.map((f: any, idx: number) => `
### Finding #${idx + 1}: ${f.title}
- **Severity / Confidence:** ${f.severity} (Confidence: ${f.confidence}%)
- **MITRE Technique:** ${f.techniqueId || "N/A"}
- **Description:** ${f.description}
`).join("\n")}

---

## 3. CHRONOLOGICAL FORENSIC TIMELINE
The following events represent the core chronology of the compromise:

${caseEvents.length === 0 ? "*No timeline events mapped yet.*" : caseEvents.map((e: any) => `
### [${e.timestamp}] ${e.event} (${e.severity.toUpperCase()})
- **MITRE Tactics/Techniques:** ${e.techniqueId ? `${e.techniqueId} - ${e.techniqueName}` : "N/A"}
- **Scope / Impact:** ${e.description}
- **Analyst Assessment:** ${e.notes || "Standard audit trail node."}
`).join("\n")}

---

## 4. SECURE EVIDENCE SUMMARY
Forensic assets preserved and locked:
${caseEvidence.length === 0 ? "*No file attachments registered in S3 lockers.*" : caseEvidence.map((ev: any) => `
- **File Asset:** ${ev.title} (\`${ev.fileUrl}\`)
  - *Type:* ${ev.type}
  - *Size:* ${ev.size}
  - *Registered:* ${ev.uploadedAt}
  - *Tag:* ${ev.tag}
`).join("\n")}

---

## 5. ANALYST ACTION NOTES
${activeCase.notes?.content || "*No raw operational notes written by analysts.*"}

---
*Report compiled securely on ${new Date().toLocaleDateString()}.*
`;
  }

  async function handleGenerateReport() {
    loading = true;
    errorMsg = "";
    try {
      if (isStaticMode) {
        const markdown = generateStaticReportMarkdown();
        reportMarkdown = markdown;
        isAiGenerated = false;
        loading = false;
        return;
      }

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
      reportMarkdown = data.report;
      isAiGenerated = data.isAiGenerated;
    } catch (err: any) {
      console.warn("Backend report generation failed, falling back to local template", err);
      const markdown = generateStaticReportMarkdown();
      reportMarkdown = markdown;
      isAiGenerated = false;
    } finally {
      loading = false;
    }
  }

  function handleCopy() {
    if (!reportMarkdown) return;
    navigator.clipboard.writeText(reportMarkdown);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  function handlePrint() {
    window.print();
  }

  // Parse lines for Svelte 5 rendering logic
  function parseMarkdownToStructuredLines(text: string) {
    if (!text) return [];
    return text.split("\n").map((line) => {
      if (line.startsWith("### ")) {
        return { type: "h3", text: line.replace("### ", "") };
      }
      if (line.startsWith("## ")) {
        return { type: "h2", text: line.replace("## ", "") };
      }
      if (line.startsWith("# ")) {
        return { type: "h1", text: line.replace("# ", "") };
      }
      if (line.startsWith("* ")) {
        const content = line.replace("* ", "");
        if (content.includes("**")) {
          const parts = content.split("**");
          const segments = parts.map((part, pIdx) => ({
            bold: pIdx % 2 === 1,
            text: part
          }));
          return { type: "li-segments", segments };
        }
        return { type: "li", text: content };
      }
      if (line.includes("**")) {
        const parts = line.split("**");
        const segments = parts.map((part, pIdx) => ({
          bold: pIdx % 2 === 1,
          text: part
        }));
        return { type: "p-segments", segments };
      }
      return { type: "p", text: line };
    });
  }

  const structuredReportLines = $derived(parseMarkdownToStructuredLines(reportMarkdown));
</script>

<div id="investigation-reporting-card" class="space-y-4">
  <!-- Tool header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2.5">
    <div>
      <h3 class="text-xs uppercase font-extrabold tracking-wider text-slate-400">Forensics Release</h3>
      <h4 class="text-sm font-bold text-slate-800">CISO Incident Executive Report Generator</h4>
    </div>
    
    <!-- Actions panel -->
    <div class="flex items-center gap-1.5">
      {#if reportMarkdown}
        <button
          id="btn-report-copy"
          onclick={handleCopy}
          title="Copy markdown block"
          class="p-1.5 hover:bg-slate-50 border border-slate-200 text-slate-600 bg-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
        >
          {#if copied}
            <Check class="h-3.5 w-3.5 text-emerald-600" />
            Copied
          {:else}
            <Copy class="h-3.5 w-3.5" />
            Copy MD
          {/if}
        </button>
        <button
          id="btn-report-print"
          onclick={handlePrint}
          title="Print layout"
          class="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Printer class="h-3.5 w-3.5" /> Print
        </button>
      {/if}

      <button
        id="btn-generate-comprehensive-report"
        onclick={handleGenerateReport}
        disabled={loading}
        class="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-violet-100 border-none"
      >
        {#if loading}
          <RefreshCw class="h-3.5 w-3.5 animate-spin" />
          Rebuilding briefing...
        {:else}
          <Cpu class="h-3.5 w-3.5" />
          Draft Executive Report
        {/if}
      </button>
    </div>
  </div>

  {#if errorMsg}
    <div class="p-3 bg-red-50 border-l-2 border-red-500 rounded text-red-900 text-xs font-medium flex items-center gap-2">
      <AlertTriangle class="h-4 w-4 text-red-600" /> {errorMsg}
    </div>
  {/if}

  <!-- Main core report print view area -->
  {#if reportMarkdown}
    <div class="space-y-4">
      <div class="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200/50 text-[10.5px] font-bold">
        <ShieldCheck class="h-3.5 w-3.5 text-emerald-600" />
        {#if isAiGenerated}
          Comprehensive briefing compiled dynamically via server-side Gemini 3.5 AI APIs.
        {:else}
          Executive summary assembled from active case data tables and rules heuristics.
        {/if}
      </div>

      <div 
        id="report-printable-area" 
        class="p-6 border border-slate-250 bg-white rounded-2xl shadow-inner max-h-[460px] overflow-y-auto font-sans leading-relaxed text-xs text-slate-800 select-text"
      >
        <div class="border-b border-double border-slate-300 pb-4 mb-6 flex justify-between items-start text-[11px] text-slate-500 uppercase tracking-widest font-mono">
          <div>
            <p class="font-extrabold text-slate-800 text-base leading-none">IRIS FORENSICS BRIEFING</p>
            <p class="mt-1">Incident Record // Identifier: {caseId}</p>
            <p>Status: {activeCase.status} // Severity: {activeCase.severity}</p>
          </div>
          <div class="text-right">
            <p>Date: {new Date().toLocaleDateString()}</p>
            <p>System Agent Node: CLOUD-S3</p>
          </div>
        </div>

        <!-- Markdown parsing block representation -->
        <div class="space-y-4 text-slate-700">
          {#each structuredReportLines as item}
            {#if item.type === "h1"}
              <h1 class="text-base font-bold text-[#111827] mt-5 mb-3 font-sans">{item.text}</h1>
            {:else if item.type === "h2"}
              <h2 class="text-sm font-bold text-slate-900 mt-4 mb-2 font-sans">{item.text}</h2>
            {:else if item.type === "h3"}
              <h3 class="text-[13.5px] font-extrabold text-slate-900 border-b border-slate-200 pb-1.5 mt-5 mb-2 font-sans uppercase tracking-tight">{item.text}</h3>
            {:else if item.type === "li"}
              <li class="ml-4 list-disc text-xs text-slate-600 leading-relaxed my-1">{item.text}</li>
            {:else if item.type === "li-segments"}
              <li class="ml-4 list-disc text-xs text-slate-600 leading-relaxed my-1">
                {#each item.segments as segment}
                  {#if segment.bold}
                    <strong class="font-bold text-slate-900">{segment.text}</strong>
                  {:else}
                    {segment.text}
                  {/if}
                {/each}
              </li>
            {:else if item.type === "p-segments"}
              <p class="min-h-[1rem] hover:text-slate-950 duration-100">
                {#each item.segments as segment}
                  {#if segment.bold}
                    <strong class="font-bold text-slate-900">{segment.text}</strong>
                  {:else}
                    {segment.text}
                  {/if}
                {/each}
              </p>
            {:else}
              <p class="min-h-[1rem] hover:text-slate-950 duration-100">{item.text}</p>
            {/if}
          {/each}
        </div>

        <!-- S3 Evidence references lists at end -->
        <div class="mt-8 border-t border-slate-200 pt-5 space-y-2">
          <span class="text-[10px] uppercase font-bold tracking-widest text-slate-400 select-none">Enclosed Locker Forensic Signatures ({caseEvidence.length} items)</span>
          {#each caseEvidence as e}
            <div class="text-[10px] font-mono text-slate-500 bg-slate-50 p-2 rounded flex items-center justify-between border border-slate-150">
              <span>📎 {e.title} // Tag: {e.tag}</span>
              <span class="text-slate-400">{e.fileUrl}</span>
            </div>
          {/each}
        </div>

        <div class="mt-12 text-center text-[10px] text-slate-400 select-none font-mono">
          *** END OF SECURITY OPERATION BRIEFING SYSTEM REPORT ***
        </div>
      </div>
    </div>
  {:else}
    <div class="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-4">
      <div class="h-10 w-10 bg-violet-50 text-violet-600 rounded-full flex items-center justify-center mx-auto">
        <FileText class="h-5 w-5" />
      </div>
      <div>
        <p class="text-xs font-bold text-slate-700">Audit Documentation Ready to Draft</p>
        <p class="text-[10px] text-slate-400 max-w-sm mx-auto mt-1">
          Select Draft Executive Report to trigger server-side aggregation pipelines, generating standard intelligence drafts with MITRE maps.
        </p>
      </div>
      <button
        id="btn-report-draft-cta"
        onclick={handleGenerateReport}
        class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all shadow-sm cursor-pointer border-none"
      >
        Draft Report Checklist
      </button>
    </div>
  {/if}
</div>
