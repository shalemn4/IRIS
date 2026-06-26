export type CaseSeverity = "Low" | "Medium" | "High" | "Critical";
export type CaseStatus = "Open" | "Investigating" | "Resolved";

export interface Case {
  id: string;
  title: string;
  description: string;
  severity: CaseSeverity;
  status: CaseStatus;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  timestamp: string;
  description: string;
  event: string; // Event category/name
  severity: CaseSeverity;
  category?: string; // MITRE ATT&CK or general category
  isSuspicious?: boolean;
  notes?: string; // Analyst custom attachment notes
  techniqueId?: string; // MITRE technique
  techniqueName?: string;
}

export interface Evidence {
  id: string;
  caseId: string;
  title: string;
  fileUrl: string;
  type: string; // e.g. "image/png", "application/pdf", "text/plain", "notes"
  size?: string;
  uploadedAt: string;
  tag?: string;
  linkedEventId?: string; // Linked timeline event
}

export interface Finding {
  id: string;
  caseId: string;
  title: string;
  description: string;
  severity: CaseSeverity;
  confidence: number; // 0-100 percentage
  reason: string;
  createdAt: string;
  techniqueId?: string; // MITRE technique
}

export interface CaseNote {
  id: string;
  caseId: string;
  content: string;
  updatedAt: string;
}

export interface ReportRecommendation {
  id: string;
  recommendation: string;
  category: "Identity" | "Network" | "Endpoint" | "Policy";
}
