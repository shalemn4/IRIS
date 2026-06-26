# Incident Response Investigation Studio (IRIS)

Incident Response Investigation Studio (IRIS) is a modern, full-stack Digital Forensics and Incident Response (DFIR) workbench. Designed for Security Operations Center (SOC) analysts and threat hunters, IRIS provides a cohesive, single-pane environment to ingest raw logs, isolate critical milestones, map activities against the MITRE ATT&CK framework, manage forensic evidence, and construct authoritative case timelines.

---

## 🌟 Key Capabilities

### 1. Ingestion & Live Forensics Analysis
- **Dual-Mode Ingestion Sandbox**: Supports direct drag-and-drop file uploads (e.g., `.txt`, `.log`, `.json`, `.csv`) and manual multi-line text pasting.
- **Bi-Directional Forensics Check (Right vs. Wrong)**:
  - **What Went Right**: Highlights secure system baselines, policy-compliant user logins, and standard authorized system activities.
  - **What Went Wrong**: Instantly flags suspicious command execution patterns, credential stuffing attempts, outbound data exfiltration, or unauthorized privilege escalation vectors.

### 2. Interactive MITRE ATT&CK Chain Mapping
- **Chronological Sequence Cards**: View step-by-step progressions of an attack cycle modeled beautifully with dynamic status flows.
- **Node Context Viewer**: Drill down into specific techniques, extraction descriptions, and associated event details instantly.

### 3. Dynamic Investigation Timeline
- **Chronological Sequencing**: Chronologically order extracted milestones with the ability to reverse-sort (Latest vs. Earliest First).
- **Custom Event Injection**: Inject manual threat observations with precise custom titles, timestamps, descriptions, and MITRE IDs.
- **Severity Filters**: Dynamically filter down events based on Threat Severity (Low, Medium, High, Critical).

### 4. Secure Evidence Locker
- **Raw File Catalogs**: Upload and bind raw forensic payloads, packet captures (PCAPs), configuration files, or memory dumps to specific timeline events.
- **Metadata Framing**: Tag and classify evidence sources with clean titles, category indicators, and explicit linked event bindings.

### 5. AI-Assisted Report Generation & Scratchpad
- **Markdown Analyst Notes**: Take persistent, formatted notes during live-analysis sessions.
- **Authored Incident Report Exporter**: Generate structured final incident summaries ready for presentation or handover.
- **Print Optimization**: Includes custom optimized media print layouts to easily save or share reports as PDF.

---

## 🛠️ Technology Stack

### Frontend (Client-side SPA)
- **Framework**: React 18 & TypeScript
- **Build System**: Vite (optimized asset building)
- **Styling**: Tailwind CSS (highly refined, modern zinc theme)
- **Icons**: Lucide React
- **Animations**: Framer Motion (for polished, organic viewport interactions)

### Backend (Server-side API)
- **Server Framework**: Node.js & Express
- **API Engines**: Intelligent pattern matcher parsing timestamps, usernames, and MITRE classification matrices.
- **AI Integration**: Powered by server-side Google Gemini SDK (`@google/genai`) for generating summaries without exposing API keys.

---

## 📂 Project Structure

```text
├── server.ts               # Custom Express full-stack entry point & log parsers
├── package.json            # Deployment scripts, engine requirements, and dependencies
├── metadata.json           # Application specifications & major capabilities
├── src/
│   ├── App.tsx             # Main layout, State managers, and UI tabs
│   ├── index.css           # Global Tailwind declarations & theme settings
│   ├── main.tsx            # React application entry point
│   ├── types.ts            # Common type definitions (Cases, Events, Evidence)
│   └── components/
│       ├── LandingPage.tsx     # Cinematic onboarding experience & preloaded cases
│       ├── Dashboard.tsx       # Live status aggregates, case metrics, and logs counter
│       ├── CasesPage.tsx       # Incident creation, status controls, and target matrices
│       ├── AttackChain.tsx     # Linear attack cycle graph visualizer
│       ├── TimelineBuilder.tsx # Active event stream, sorting, filtering, and manual injects
│       ├── EvidenceLocker.tsx  # Drag-and-drop secure forensic storage binder
│       ├── NotesEditor.tsx     # Analyst scratchpad
│       └── ReportSystem.tsx    # PDF-friendly report generator with AI integration
```

---

## 🚀 Getting Started

### 1. Installation
Install the project dependencies locally:
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to create a local environment file and include your API secrets:
```bash
cp .env.example .env
```
Ensure your Gemini credentials are added safely inside `.env`:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 3. Run Development Server
Boot up the integrated Vite/Express server:
```bash
npm run dev
```
The server will start running on port `3000`.

### 4. Production Build & Execution
Compile both frontend and backend for high-performance production distribution:
```bash
npm run build
npm run start
```
This bundles the backend into a robust standalone package under `dist/server.cjs` and compiles the client-side SPA into `dist/`.