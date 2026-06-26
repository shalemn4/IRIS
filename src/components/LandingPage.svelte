<script lang="ts">
  import { 
    Shield, 
    ArrowRight, 
    Layers, 
    FileText, 
    Zap, 
    HelpCircle, 
    HardDrive, 
    Cpu, 
    Database, 
    Eye 
  } from 'lucide-svelte';

  // Svelte 5 props
  const { onStart, onLoadDemo } = $props();

  const features = [
    {
      title: "Log Parsing Module",
      description: "Upload JSON, CSV or raw event logs. IRIS extracts relevant timestamps, systems, and actions automatically."
    },
    {
      title: "Real-time Findings Engine",
      description: "Automated analysis scans indicators for encoded commands, exfiltration pathways, and privilege abuse."
    },
    {
      title: "MITRE ATT&CK Mapping",
      description: "Categorize events against enterprise attack techniques. Map your timeline to standard tactics instantly."
    },
    {
      title: "CISO Executive Reporter",
      description: "Generates custom summary reports, forensic logs, and actionable recommendations with server-side AI integration."
    }
  ];

  const workflowSteps = [
    {
      number: "01",
      title: "Ingest Data",
      desc: "Drag in raw logs from servers, firewalls, or Active Directory hosts."
    },
    {
      number: "02",
      title: "Investigate and Tag",
      desc: "Pinpoint indicators, attach files, and link notes to individual events."
    },
    {
      number: "03",
      title: "Correlate Strategy",
      desc: "Visualize your entire multi-stage compromise path in our visual graph tracker."
    },
    {
      number: "04",
      title: "Generate Intelligence",
      desc: "Produce executive reports with MITRE tactics, indicators, and mitigations."
    }
  ];

  const faqs = [
    {
      q: "What types of logs does the IRIS parser support?",
      a: "IRIS natively parses structured JSON arrays, standard format CSV worksheets, and general text alerts (such as syslog and Windows Event channel copies)."
    },
    {
      q: "How does the AI Summarization feature operate?",
      a: "IRIS sends the current investigation's structured timeline, compiled findings, and evidence references safely to server-side Gemini 3.5 APIs to auto-draft CISO summaries and strategic actions."
    },
    {
      q: "Where is log and evidence data persistent?",
      a: "Data points are tracked in our relational system, with evidence locker files mirrored to AWS S3 storage buckets, keeping artifacts safe from local storage cleared caches."
    }
  ];
</script>

<div class="min-h-screen bg-zinc-50/50 text-slate-800 selection:bg-violet-200">
  <!-- Soft color decorative top blur -->
  <div class="absolute top-0 left-1/4 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl pointer-events-none"></div>
  <div class="absolute top-20 right-1/4 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none"></div>

  <!-- Global navbar -->
  <nav id="landing-navbar" class="relative max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-violet-100/50">
    <div class="flex items-center gap-2.5">
      <div class="h-9 w-9 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-violet-200">
        <Shield class="h-5 w-5" />
      </div>
      <span class="font-sans font-bold tracking-tight text-slate-900 text-lg">IRIS</span>
      <span class="text-xs bg-violet-100 text-violet-700 px-2.5 py-0.5 rounded-full font-medium">SOC Studio v2.4</span>
    </div>
    <div class="flex items-center gap-4">
      <button 
        id="nav-load-demo"
        onclick={onLoadDemo} 
        class="text-xs font-semibold px-4 py-2 text-violet-700 bg-violet-100/60 hover:bg-violet-100 hover:text-violet-900 transition-all rounded-lg border border-violet-200/50 cursor-pointer"
      >
        Play Live Demo
      </button>
      <button 
        id="nav-start"
        onclick={onStart} 
        class="text-xs font-semibold px-4.5 py-2 bg-slate-900 hover:bg-slate-800 text-white transition-all rounded-lg shadow-sm cursor-pointer"
      >
        Launch Portal
      </button>
    </div>
  </nav>

  <!-- Hero Section -->
  <section id="hero" class="relative max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
    <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100/80 mb-6">
      <Shield class="h-3.5 w-3.5" /> Premium Incident Response Studio for SOC Teams
    </span>
    <h1 class="font-sans font-bold text-4xl sm:text-6xl tracking-tight text-slate-900 leading-[1.1] max-w-4xl mx-auto">
      Turn Security Chaos Into <span class="text-violet-600">Clear Timelines</span>.
    </h1>
    <p class="font-sans text-slate-600 text-lg sm:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
      Reconstruct security incidents, map attacker steps to the MITRE ATT&CK framework, catalog indicators, and generate professional intelligence reports.
    </p>

    <!-- Hero CTA Block -->
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
      <button
        id="btn-hero-start"
        onclick={onStart}
        class="w-full sm:w-auto px-7 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-violet-200 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
      >
        Start New Investigation <ArrowRight class="h-4 w-4" />
      </button>
      <button
        id="btn-hero-demo"
        onclick={onLoadDemo}
        class="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl text-sm transition-all border border-slate-200 flex items-center justify-center gap-2 cursor-pointer"
      >
        <Eye class="h-4 w-4 text-slate-500" /> Open Demo Case (Active Intrusion)
      </button>
    </div>

    <!-- Decorative interface Preview Card mock -->
    <div class="relative mt-16 p-2 bg-white/70 border border-slate-200/50 rounded-2xl shadow-xl max-w-4xl mx-auto">
      <div class="bg-zinc-50 rounded-xl border border-slate-200/60 overflow-hidden text-left p-6">
        <div class="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-rose-400"></span>
            <span class="w-3 h-3 rounded-full bg-amber-400"></span>
            <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
            <span class="text-xs font-mono text-slate-400 ml-2">Active Investigation Workspace // case-demo-01</span>
          </div>
          <span class="text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded border border-rose-100 font-medium">Critical Bug Boundary Alert</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm col-span-2">
            <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Threat Timeline</h4>
            <div id="timeline-mock-list" class="space-y-3.5">
              <div class="flex items-start gap-3">
                <span class="font-mono text-[10px] text-violet-500 bg-violet-50 px-2 py-0.5 rounded mt-0.5 font-bold">11:04 AM</span>
                <div>
                  <p class="text-xs font-semibold text-slate-800">Suspicious Command Line Spawned</p>
                  <p class="text-[10px] text-slate-500 font-mono mt-0.5">powershell.exe -ExecutionPolicy Bypass -NoProfile -enc SQBFAFg...</p>
                </div>
              </div>
              <div class="flex items-start gap-3 border-t border-slate-100 pt-3">
                <span class="font-mono text-[10px] text-amber-500 bg-amber-50 px-2 py-0.5 rounded mt-0.5 font-bold">11:09 AM</span>
                <div>
                  <p class="text-xs font-semibold text-slate-800">Workstation credential backup hives exported</p>
                  <p class="text-[10px] text-slate-500 mt-0.5">SAM credentials file backup dumped locally. Target: OS credential access.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="space-y-4">
            <div class="bg-emerald-50/60 border border-emerald-100 p-4 rounded-lg">
              <span class="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Mitigation Response</span>
              <p class="text-xs font-bold text-emerald-950 mt-1">Host Isolated</p>
              <p class="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">System immediately decoupled from active domain subnet routing paths.</p>
            </div>
            <div class="bg-violet-50/60 border border-violet-100 p-4 rounded-lg">
              <span class="text-[10px] uppercase font-bold text-violet-800 tracking-wider">Generative Agent Report</span>
              <p class="text-[11px] text-violet-700 italic mt-1 font-serif">"Executive CISO report compiled instantly incorporating MITRE framework techniques..."</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features bento style section -->
  <section id="features" class="max-w-6xl mx-auto px-6 py-20 border-t border-slate-200/45">
    <div class="text-center max-w-2xl mx-auto mb-16">
      <h2 class="text-3xl font-bold tracking-tight text-slate-900">The Modern Analyst's Forensic Toolkit.</h2>
      <p class="text-slate-600 mt-3">Replaces ugly black command-line hacker matrices with beautiful pastel visualizer workflows designed for forensic accuracy.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each features as feature, idx}
        <div class="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div class="h-11 w-11 bg-slate-50 rounded-xl flex items-center justify-center mb-5 border border-slate-100">
              {#if idx === 0}
                <Layers class="h-6 w-6 text-violet-500" />
              {:else if idx === 1}
                <Zap class="h-6 w-6 text-amber-500" />
              {:else if idx === 2}
                <Shield class="h-6 w-6 text-emerald-500" />
              {:else}
                <FileText class="h-6 w-6 text-blue-500" />
              {/if}
            </div>
            <h3 class="text-sm font-semibold text-slate-900">{feature.title}</h3>
            <p class="text-xs text-slate-600 leading-relaxed mt-2.5">{feature.description}</p>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Workflow steps -->
  <section id="workflow" class="max-w-6xl mx-auto px-6 py-16 bg-white border border-slate-200 rounded-3xl mb-20 text-slate-800">
    <div class="text-center max-w-xl mx-auto mb-12">
      <span class="text-[11px] uppercase tracking-widest font-bold text-violet-600">The SOC Pipeline</span>
      <h2 class="text-2xl font-bold tracking-tight text-slate-900 mt-1">Accelerate Chronological Threat Mapping</h2>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {#each workflowSteps as step}
        <div class="relative">
          <span class="font-mono class text-3xl font-bold text-violet-200/80">{step.number}</span>
          <h4 class="text-xs font-semibold text-slate-900 mt-2">{step.title}</h4>
          <p class="text-xs text-slate-600 mt-2 leading-relaxed">{step.desc}</p>
        </div>
      {/each}
    </div>
  </section>

  <!-- Architecture diagram section -->
  <section id="architecture" class="max-w-6xl mx-auto px-6 py-12 mb-20">
    <div class="text-center max-w-2xl mx-auto mb-10">
      <span class="text-xs font-bold text-violet-600 uppercase tracking-widest">SaaS Cloud Architecture Map</span>
      <h2 class="text-2xl font-bold mt-1 text-slate-900">IRIS Secure Cloud Deploy</h2>
      <p class="text-xs text-slate-600 mt-2">Enterprise-ready ingestion and processing mapping securely in AWS regions.</p>
    </div>
    <div class="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-4xl mx-auto shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        <!-- AWS CloudFront -->
        <div class="p-4 rounded-2xl bg-[#EDE9FE]/50 border border-violet-100 flex flex-col items-center">
          <Layers class="h-7 w-7 text-violet-600 mb-2" />
          <span class="text-[11px] font-bold text-slate-900">AWS CloudFront</span>
          <span class="text-[9px] text-slate-500 font-mono mt-1">Static React Hosting</span>
        </div>

        <!-- AWS EC2 Backend -->
        <div class="p-4 rounded-2xl bg-[#DBEAFE]/50 border border-blue-100 flex flex-col items-center">
          <Cpu class="h-7 w-7 text-blue-600 mb-2" />
          <span class="text-[11px] font-bold text-slate-900">AWS EC2 Server</span>
          <span class="text-[9px] text-slate-500 font-mono mt-1">Express API Service</span>
        </div>

        <!-- AWS S3 Evidence Locker -->
        <div class="p-4 rounded-2xl bg-[#FED7AA]/50 border border-orange-100 flex flex-col items-center">
          <HardDrive class="h-7 w-7 text-orange-600 mb-2" />
          <span class="text-[11px] font-bold text-slate-900">AWS S3 Locker</span>
          <span class="text-[9px] text-slate-500 font-mono mt-1">Encrypted File Storage</span>
        </div>

        <!-- AWS RDS Postgres -->
        <div class="p-4 rounded-2xl bg-[#D1FAE5]/50 border border-emerald-100 flex flex-col items-center">
          <Database class="h-7 w-7 text-emerald-600 mb-2" />
          <span class="text-[11px] font-bold text-slate-900">AWS RDS Postgres</span>
          <span class="text-[9px] text-slate-500 font-mono mt-1">Case & Event Tables</span>
        </div>
      </div>

      <div class="mt-8 border-t border-slate-100 pt-6 flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-[11px] text-slate-500 font-medium">
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-violet-600"></span> Edge Routing via CDN</span>
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-blue-600"></span> Node Express REST Gateway</span>
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-600"></span> Automated Backups Enabled</span>
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-500"></span> Real-time Sentry Error Tracking</span>
      </div>
    </div>
  </section>

  <!-- FAQ section -->
  <section id="faqs" class="max-w-4xl mx-auto px-6 py-12 mb-24">
    <div class="flex items-center gap-2 mb-8">
      <HelpCircle class="h-5 w-5 text-violet-500" />
      <h2 class="text-xl font-bold tracking-tight text-slate-900">Frequently Asked Questions</h2>
    </div>
    <div class="space-y-6">
      {#each faqs as faq}
        <div class="bg-white p-5 rounded-2xl border border-slate-200">
          <h4 class="text-[13px] font-bold text-slate-900">{faq.q}</h4>
          <p class="text-xs text-slate-600 mt-2 leading-relaxed">{faq.a}</p>
        </div>
      {/each}
    </div>
  </section>

  <!-- Modern minimal footer -->
  <footer class="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
    <div class="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
      <div class="flex items-center gap-2">
        <div class="h-7 w-7 bg-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">I</div>
        <span class="font-sans font-bold text-white text-sm">IRIS Incident Studio</span>
      </div>
      <p class="text-xs">Security Analyst Portfolio Project // Designed for Forensic Excellence in the Cloud.</p>
    </div>
  </footer>
</div>
