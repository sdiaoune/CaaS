export interface Connector {
  id: string
  name: string
  status: "connected" | "syncing" | "error" | "disconnected"
  lastSyncAt?: Date
  errors?: string[]
  icon: string
}

export interface Document {
  id: string
  title: string
  source: string
  tokens: number
  chunks: number
  piiFlags: string[]
  status: "indexed" | "processing" | "error"
  ingressDate: Date
}

export interface Pipeline {
  id: string
  name: string
  indexName: string
  reranker: string
  guardrails: string[]
  lastDeployHash: string
  status: "active" | "draft" | "error"
}

export interface EvalSet {
  id: string
  name: string
  domain: string
  items: number
  lastRunAt?: Date
  passRate: number
}

export interface EvalRun {
  id: string
  model: string
  pipelineId: string
  accuracy: number
  hallucinationRate: number
  toxicity: number
  costUSD: number
  durationMs: number
  createdAt: Date
}

export interface AuditEvent {
  id: string
  type: string
  actor: string
  timestamp: Date
  target: string
  diff?: object
}

export interface KpiMetric {
  label: string
  value: string
  change: number
  trend: "up" | "down" | "neutral"
}
