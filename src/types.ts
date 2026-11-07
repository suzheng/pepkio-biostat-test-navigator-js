// SPDX-License-Identifier: MIT

export type RunStatus = "queued" | "running" | "completed" | "failed" | (string & {});

export interface RunOptions {
  idempotency_key?: string;
  label?: string;
  [key: string]: unknown;
}

export interface RunResult<T = BiostatTestNavigatorResult> {
  run_id: string;
  status: RunStatus;
  result?: T;
  error?: string | { message?: string; code?: string; details?: unknown } | null;
  result_url?: string;
  permalink?: string;
  duration_ms?: number;
}

export interface ManifestExample {
  name: string;
  description?: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
}

export interface ToolManifest {
  schema_version: string;
  tool_id: string;
  title: string;
  description?: string;
  tags?: string[];
  category?: string;
  execution_mode?: string;
  estimated_runtime_sec?: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  agent_notes?: string;
  example_prompts?: string[];
  examples?: ManifestExample[];
  limits?: Record<string, unknown>;
  input_schema?: Record<string, unknown>;
}

export interface ExampleMeta {
  name: string;
  description?: string;
}

export type TemplateId =
  | "qpcr"
  | "flow_cytometry"
  | "western_blot"
  | "survival"
  | "rna_seq_small_n"
  | "custom";

export type OutcomeType = "continuous" | "categorical" | "survival";

export type ComparisonType = "two_groups" | "multiple_groups" | "paired_before_after";

export type PostHocIntent = "all_pairs" | "vs_control";

export type DataFormat = "wide" | "long";

export interface GroupData {
  name: string;
  values: number[];
}

export type CategoricalTable = number[][];

export interface NormalityCheck {
  statistic?: number;
  p_value?: number;
  is_normal?: boolean;
  method?: string;
  [key: string]: unknown;
}

export interface VarianceCheck {
  statistic?: number;
  p_value?: number;
  is_homogeneous?: boolean;
  method?: string;
  [key: string]: unknown;
}

export interface AssumptionChecks {
  normality?: Record<string, NormalityCheck>;
  variance_homogeneity?: VarianceCheck;
  outliers?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface GroupSummary {
  name: string;
  n: number;
  mean?: number;
  sd?: number;
  median?: number;
  iqr?: number;
  min?: number;
  max?: number;
  [key: string]: unknown;
}

/** Output shape returned by biostat-test-navigator */
export interface BiostatTestNavigatorResult {
  ready: boolean;
  preliminary?: boolean;
  primary_test?: string;
  primary_test_key?: string;
  post_hoc_test?: string;
  effect_size_metric?: string;
  parametric_path?: boolean | string | Record<string, unknown>;
  rationale?: string;
  methods_paragraph?: string;
  decision_path?: (string | Record<string, unknown>)[];
  assumption_checks?: AssumptionChecks;
  group_summaries?: GroupSummary[] | Record<string, unknown>;
  warnings?: string[];
  code_r?: string;
  code_python?: string;
  summary_csv?: string;
  error?: string | null;
  [key: string]: unknown;
}

export class PepkioAPIError extends Error {
  readonly status: number;
  readonly body?: unknown;
  readonly runId?: string;
  readonly code?: string;

  constructor(
    message: string,
    opts: { status: number; body?: unknown; runId?: string; code?: string },
  ) {
    super(message);
    this.name = "PepkioAPIError";
    this.status = opts.status;
    this.body = opts.body;
    this.runId = opts.runId;
    this.code = opts.code;
  }
}
