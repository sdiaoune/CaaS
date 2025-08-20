"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GitBranch, Database, Zap, Shield, ArrowRight, Settings, Play, Pause, Trash2 } from "lucide-react"
import type { Pipeline } from "@/lib/types"
import { useState } from "react"
import { Input } from "@/components/ui/input"

interface PipelineDetailModalProps {
  pipeline: Pipeline | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onChanged?: () => Promise<void> | void
}

export function PipelineDetailModal({ pipeline, open, onOpenChange, onChanged }: PipelineDetailModalProps) {
  if (!pipeline) return null

  const [name, setName] = useState(pipeline.name)
  const [indexName, setIndexName] = useState(pipeline.indexName)
  const [reranker, setReranker] = useState(pipeline.reranker)
  const [guardrails, setGuardrails] = useState<string[]>(pipeline.guardrails)
  const [saving, setSaving] = useState(false)

  const getStatusBadge = (status: Pipeline["status"]) => {
    const config = {
      active: {
        variant: "default" as const,
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      },
      draft: { variant: "secondary" as const, color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" },
      error: { variant: "destructive" as const, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
    }
    return (
      <Badge variant={config[status].variant} className={config[status].color}>
        {status}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitBranch className="h-6 w-6 text-accent" />
              <div>
                <DialogTitle>{pipeline.name}</DialogTitle>
                <DialogDescription>Pipeline configuration and monitoring</DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(pipeline.status)}
              <Button size="sm" variant="outline" onClick={async ()=>{
                if (pipeline.status !== 'active') {
                  await fetch(`/api/pipelines/${pipeline.id}/deploy`, { method: 'POST' })
                  if (onChanged) await onChanged()
                }
              }}>
                {pipeline.status === "active" ? (
                  <>
                    <Pause className="h-3 w-3 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-1" />
                    Deploy
                  </>
                )}
              </Button>
              <Button size="sm" variant="outline" className="text-red-600" onClick={async ()=>{
                await fetch(`/api/pipelines/${pipeline.id}`, { method: 'DELETE' })
                if (onChanged) await onChanged()
                onOpenChange(false)
              }}>
                <Trash2 className="h-3 w-3 mr-1" />Delete
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="graph">Pipeline Graph</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Pipeline Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    {getStatusBadge(pipeline.status)}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-muted-foreground block text-xs">Name</span>
                      <Input value={name} onChange={(e)=> setName(e.target.value)} />
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Index</span>
                      <Input value={indexName} onChange={(e)=> setIndexName(e.target.value)} />
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Reranker</span>
                      <Input value={reranker} onChange={(e)=> setReranker(e.target.value)} />
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Guardrails (comma separated)</span>
                      <Input value={guardrails.join(',')} onChange={(e)=> setGuardrails(e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deploy Hash:</span>
                    <span className="font-mono text-xs">{pipeline.lastDeployHash}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Latency:</span>
                    <span className="font-medium">245ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Requests/min:</span>
                    <span className="font-medium">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Success Rate:</span>
                    <span className="font-medium text-green-600">99.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost/1k tokens:</span>
                    <span className="font-medium">$0.0012</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Guardrails</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {pipeline.guardrails.map((guardrail) => (
                    <Badge key={guardrail} variant="outline" className="gap-1">
                      <Shield className="h-3 w-3" />
                      {guardrail}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="graph" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pipeline Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-8">
                  <div className="flex items-center gap-4">
                    {/* Source Node */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Database className="h-8 w-8 text-blue-600" />
                      </div>
                      <span className="text-xs mt-2">Sources</span>
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground" />

                    {/* Chunker Node */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <Settings className="h-8 w-8 text-purple-600" />
                      </div>
                      <span className="text-xs mt-2">Chunker</span>
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground" />

                    {/* Embedder Node */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <Zap className="h-8 w-8 text-green-600" />
                      </div>
                      <span className="text-xs mt-2">Embedder</span>
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground" />

                    {/* Vector Store Node */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                        <Database className="h-8 w-8 text-yellow-600" />
                      </div>
                      <span className="text-xs mt-2">Vector Store</span>
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground" />

                    {/* Retriever Node */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                        <Shield className="h-8 w-8 text-orange-600" />
                      </div>
                      <span className="text-xs mt-2">Retriever</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Click on any node to configure its settings
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Retrieval Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Number of Documents (k)</label>
                    <input
                      type="number"
                      defaultValue="5"
                      className="w-full p-2 border border-border rounded-md bg-background mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Similarity Threshold</label>
                    <input
                      type="number"
                      step="0.1"
                      defaultValue="0.7"
                      className="w-full p-2 border border-border rounded-md bg-background mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Output Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Response Format</label>
                    <select className="w-full p-2 border border-border rounded-md bg-background mt-1">
                      <option value="json">JSON</option>
                      <option value="markdown">Markdown</option>
                      <option value="text">Plain Text</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Response Length</label>
                    <input
                      type="number"
                      defaultValue="2000"
                      className="w-full p-2 border border-border rounded-md bg-background mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button disabled={saving} onClick={async ()=>{
            setSaving(true)
            await fetch(`/api/pipelines/${pipeline.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, indexName, reranker, guardrails, config: {} }) })
            setSaving(false)
            if (onChanged) await onChanged()
          }}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
