export type BulkEntity =
  | 'students'
  | 'staff'
  | 'finance-accounts'
  | 'finance-heads'
  | 'finance-income'
  | 'finance-expenses';

export type IssueSeverity = 'error' | 'warning';
export type RowStatus = 'ready' | 'warning' | 'error';

export interface RowIssue {
  column?: string;
  message: string;
  severity: IssueSeverity;
}

export interface ReportColumn {
  key: string;
  header: string;
  required: boolean;
}

export interface ReportRow {
  row: number;
  status: RowStatus;
  values: Record<string, string>;
  issues: RowIssue[];
}

export interface ValidationReport {
  entity: BulkEntity;
  label: string;
  file_name: string;
  columns: ReportColumn[];
  header_issues: string[];
  summary: { total: number; ready: number; warning: number; error: number };
  rows: ReportRow[];
}

export interface ImportCredential {
  row: number;
  name: string;
  phone_number: string;
  temporary_password: string;
}

export interface ImportRowResult {
  row: number;
  status: 'created' | 'failed';
  label: string;
  message?: string;
}

export interface ImportJob {
  job_id: string;
  entity: BulkEntity;
  status: 'running' | 'completed' | 'failed';
  total: number;
  processed: number;
  created: number;
  failed: number;
  skipped: number;
  results: ImportRowResult[];
  credentials: ImportCredential[];
  error?: string;
  started_at: string;
  finished_at?: string;
}
