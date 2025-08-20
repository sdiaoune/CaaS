"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CreatePipelineModal } from "@/components/create-pipeline-modal"
import { PipelineDetailModal } from "@/components/pipeline-detail-modal"
import { Plus, Search, GitBranch, Settings, Play, Pause } from "lucide-react"
import type { Pipeline } from "@/lib/types"

export default function PipelinesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null)
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [projectId, setProjectId] = useState<string | null>(null)

  const parseJsonSafely = async (res: Response): Promise<any | null> => {
    try {
      const text = await res.text()
      if (!text) return null
      return JSON.parse(text)
    } catch {
      return null
    }
  }

  useEffect(() => {
    ;(async () => {
      const me = await fetch('/api/me/project')
      const meData = await parseJsonSafely(me)
      const project = meData?.project
      if (!project?.id) return
      setProjectId(project.id)
      const res = await fetch(`/api/pipelines/list?projectId=${project.id}`)
      const data = await parseJsonSafely(res)
      setPipelines(((data?.items as any[]) || []).map((p: any) => ({ id: p.id, name: p.name, indexName: p.index_name || '', reranker: p.reranker || '', guardrails: p.guardrails || [], lastDeployHash: p.last_deploy_hash || '', status: 'active' })))
    })()
  }, [])

  const filteredPipelines = pipelines.filter((pipeline) => pipeline.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const refresh = async (pid?: string) => {
    const id = pid ?? projectId
    if (!id) return
    const res = await fetch(`/api/pipelines/list?projectId=${id}`)
    const text = await res.text().catch(()=> '')
    const data = text ? JSON.parse(text) : null
    setPipelines(((data?.items as any[]) || []).map((p: any) => ({ id: p.id, name: p.name, indexName: p.index_name || '', reranker: p.reranker || '', guardrails: p.guardrails || [], lastDeployHash: p.last_deploy_hash || '', status: 'active' })))
  }

  const getStatusBadge = (status: Pipeline["status"]) => {
    const config = {
      active: { variant: "default" as const, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      draft: { variant: "secondary" as const, color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" },
      error: { variant: "destructive" as const, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
    }
    return (<Badge variant={config[status].variant} className={config[status].color}>{status}</Badge>)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pipelines</h1>
          <p className="text-muted-foreground">Manage your RAG pipelines and configurations</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus className="mr-2 h-4 w-4" />
          Create Pipeline
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search pipelines..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      {/* Pipeline Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPipelines.map((pipeline) => (
          <Card key={pipeline.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-accent" />
                <CardTitle className="text-lg">{pipeline.name}</CardTitle>
              </div>
              {getStatusBadge(pipeline.status)}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Index:</span><span className="font-medium">{pipeline.indexName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Reranker:</span><span className="font-medium">{pipeline.reranker}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Deploy Hash:</span><span className="font-mono text-xs">{pipeline.lastDeployHash}</span></div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Guardrails:</p>
                <div className="flex gap-1 flex-wrap">{pipeline.guardrails.map((g) => (<Badge key={g} variant="outline" className="text-xs">{g}</Badge>))}</div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => setSelectedPipeline(pipeline)} className="flex-1"><Settings className="h-3 w-3 mr-1" />Configure</Button>
                <Button size="sm" variant="outline">{pipeline.status === "active" ? (<><Pause className="h-3 w-3 mr-1" />Pause</>) : (<><Play className="h-3 w-3 mr-1" />Deploy</>)}</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPipelines.length === 0 && (
        <div className="text-center py-12">
          <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No pipelines found.</p>
          <Button onClick={() => setShowCreateModal(true)} variant="outline">Create Your First Pipeline</Button>
        </div>
      )}

      {/* Modals */}
      <CreatePipelineModal open={showCreateModal} onOpenChange={setShowCreateModal} />
      <PipelineDetailModal pipeline={selectedPipeline} open={!!selectedPipeline} onOpenChange={(open) => { if (!open) setSelectedPipeline(null) }} onChanged={async ()=> { await refresh() }} />
    </div>
  )
}
