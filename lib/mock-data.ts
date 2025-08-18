import type { Connector, Document, Pipeline, EvalSet, KpiMetric } from "./types"

export const mockConnectors: Connector[] = [
  { id: "1", name: "Google Drive", status: "connected", lastSyncAt: new Date("2024-01-15T10:30:00Z"), icon: "drive" },
  { id: "2", name: "Notion", status: "syncing", icon: "notion" },
  { id: "3", name: "Confluence", status: "error", errors: ["Authentication expired"], icon: "confluence" },
  { id: "4", name: "SharePoint", status: "disconnected", icon: "sharepoint" },
  { id: "5", name: "GitHub", status: "connected", lastSyncAt: new Date("2024-01-15T08:15:00Z"), icon: "github" },
  { id: "6", name: "Zendesk", status: "disconnected", icon: "zendesk" },
  { id: "7", name: "Intercom", status: "connected", lastSyncAt: new Date("2024-01-15T09:45:00Z"), icon: "intercom" },
  { id: "8", name: "S3", status: "disconnected", icon: "s3" },
]

export const mockDocuments: Document[] = [
  {
    id: "1",
    title: "Product Requirements Document - Q1 2024",
    source: "Google Drive",
    tokens: 15420,
    chunks: 87,
    piiFlags: ["email", "phone"],
    status: "indexed",
    ingressDate: new Date("2024-01-15T10:30:00Z"),
  },
  {
    id: "2",
    title: "API Documentation v2.1",
    source: "GitHub",
    tokens: 8930,
    chunks: 45,
    piiFlags: [],
    status: "indexed",
    ingressDate: new Date("2024-01-15T08:15:00Z"),
  },
  {
    id: "3",
    title: "Customer Support Guidelines",
    source: "Notion",
    tokens: 12340,
    chunks: 62,
    piiFlags: ["email"],
    status: "processing",
    ingressDate: new Date("2024-01-15T11:00:00Z"),
  },
]

export const mockPipelines: Pipeline[] = [
  {
    id: "1",
    name: "Customer Support RAG",
    indexName: "support-docs-v1",
    reranker: "cross-encoder-ms-marco",
    guardrails: ["PII", "Toxicity"],
    lastDeployHash: "a1b2c3d4",
    status: "active",
  },
  {
    id: "2",
    name: "Product Documentation",
    indexName: "product-docs-v2",
    reranker: "bge-reranker-large",
    guardrails: ["PII"],
    lastDeployHash: "e5f6g7h8",
    status: "active",
  },
]

export const mockKpis: KpiMetric[] = [
  { label: "Indexed Docs", value: "2,847", change: 12.5, trend: "up" },
  { label: "Avg Retrieval Precision", value: "0.847", change: -2.1, trend: "down" },
  { label: "Answer Hallucination Rate", value: "3.2%", change: -15.3, trend: "up" },
  { label: "Latency (p95)", value: "245ms", change: 8.7, trend: "down" },
]

export const mockEvalSets: EvalSet[] = [
  {
    id: "1",
    name: "Customer Support QA",
    domain: "support",
    items: 150,
    lastRunAt: new Date("2024-01-15T09:30:00Z"),
    passRate: 0.847,
  },
  {
    id: "2",
    name: "Product Knowledge Base",
    domain: "product",
    items: 89,
    lastRunAt: new Date("2024-01-14T16:20:00Z"),
    passRate: 0.923,
  },
]
