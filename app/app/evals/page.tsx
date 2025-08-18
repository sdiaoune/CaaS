"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreateEvalSetModal } from "@/components/create-eval-set-modal"
import { EvalDetailModal } from "@/components/eval-detail-modal"
import { Plus, Search, Play, BarChart3, TrendingUp, TrendingDown, Clock, DollarSign } from "lucide-react"
import type { EvalSet, EvalRun } from "@/lib/types"

export default function EvalsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedEvalSet, setSelectedEvalSet] = useState<EvalSet | null>(null)
  const [activeTab, setActiveTab] = useState<"sets" | "runs">("sets")
  const [evalSets, setEvalSets] = useState<EvalSet[]>([])
  const [evalRuns, setEvalRuns] = useState<EvalRun[]>([])
  const [projectId, setProjectId] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const me = await fetch('/app/api/me/project')
      const { project } = await me.json()
      if (!project?.id) return
      setProjectId(project.id)
      const setsRes = await fetch(`/app/api/evals/sets?projectId=${project.id}`)
      const runsRes = await fetch(`/app/api/evals/runs?projectId=${project.id}`)
      const sets = await setsRes.json()
      const runs = await runsRes.json()
      setEvalSets((sets.items || []).map((s: any) => ({ id: s.id, name: s.name, domain: s.domain || 'general', items: s.items || 0, passRate: 0, lastRunAt: s.updated_at ? new Date(s.updated_at) : undefined })))
      setEvalRuns((runs.items || []).map((r: any) => ({ id: r.id, model: r.model || 'model', pipelineId: r.pipeline_id || 'pipeline', accuracy: r.accuracy || 0, hallucinationRate: r.hallucination_rate || 0, toxicity: r.toxicity || 0, costUSD: r.cost_usd || 0, durationMs: r.duration_ms || 0, createdAt: new Date(r.created_at) })))
    })()
  }, [])

  const filteredEvalSets = evalSets.filter((evalSet) => evalSet.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredEvalRuns = evalRuns.filter((run) => run.model.toLowerCase().includes(searchQuery.toLowerCase()) || run.pipelineId.toLowerCase().includes(searchQuery.toLowerCase()))

  const runEval = async (evalSetId: string) => {
    if (!projectId) return
    await fetch('/app/api/evals/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, evalSetId, model: 'demo' }) })
    const runsRes = await fetch(`/app/api/evals/runs?projectId=${projectId}`)
    const runs = await runsRes.json()
    setEvalRuns((runs.items || []).map((r: any) => ({ id: r.id, model: r.model || 'model', pipelineId: r.pipeline_id || 'pipeline', accuracy: r.accuracy || 0, hallucinationRate: r.hallucination_rate || 0, toxicity: r.toxicity || 0, costUSD: r.cost_usd || 0, durationMs: r.duration_ms || 0, createdAt: new Date(r.created_at) })))
  }

  const getMetricBadge = (value: number, type: "accuracy" | "hallucination" | "toxicity") => {
    let color = "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    if (type === "accuracy") {
      color = value >= 0.9 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : value >= 0.8 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    } else {
      color = value <= 0.02 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : value <= 0.05 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    }
    return (<Badge variant="outline" className={color}>{type === "accuracy" ? `${(value * 100).toFixed(1)}%` : `${(value * 100).toFixed(1)}%`}</Badge>)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Evaluations</h1>
          <p className="text-muted-foreground">Monitor and improve your RAG system quality</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground"><Plus className="mr-2 h-4 w-4" />Create Eval Set</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{(evalRuns[0]?.accuracy ?? 0 * 100).toFixed?.(1)}%</div><p className="text-xs text-muted-foreground">Avg Accuracy</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-green-600">{((evalRuns[0]?.hallucinationRate ?? 0) * 100).toFixed(1)}%</div><p className="text-xs text-muted-foreground">Hallucination Rate</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">${(evalRuns[0]?.costUSD ?? 0).toFixed(2)}</div><p className="text-xs text-muted-foreground">Avg Cost per Run</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{Math.round(evalRuns[0]?.durationMs ?? 0)}s</div><p className="text-xs text-muted-foreground">Avg Duration</p></CardContent></Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4">
        <div className="flex gap-1">
          <Button variant={activeTab === "sets" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("sets")}>Evaluation Sets</Button>
          <Button variant={activeTab === "runs" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("runs")}>Recent Runs</Button>
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={activeTab === "sets" ? "Search eval sets..." : "Search runs..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
      </div>

      {/* Content */}
      {activeTab === "sets" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvalSets.map((evalSet) => (
            <Card key={evalSet.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-accent" /><CardTitle className="text-lg">{evalSet.name}</CardTitle></div>
                <Badge variant="outline" className="capitalize">{evalSet.domain}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Items:</span><span className="font-medium">{evalSet.items}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Pass Rate:</span><div className="flex items-center gap-2"><span className="font-medium">{(evalSet.passRate * 100).toFixed(1)}%</span>{evalSet.passRate >= 0.9 ? (<TrendingUp className="h-3 w-3 text-green-600" />) : evalSet.passRate >= 0.8 ? (<TrendingUp className="h-3 w-3 text-yellow-600" />) : (<TrendingDown className="h-3 w-3 text-red-600" />)}</div></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Last Run:</span><span className="text-xs">{evalSet.lastRunAt ? evalSet.lastRunAt.toLocaleDateString() : "Never"}</span></div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedEvalSet(evalSet)} className="flex-1">View Details</Button>
                  <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => runEval(evalSet.id)}><Play className="h-3 w-3 mr-1" />Run</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Pipeline</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Hallucination</TableHead>
                  <TableHead>Toxicity</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvalRuns.map((run) => (
                  <TableRow key={run.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{run.model}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{run.pipelineId}</Badge></TableCell>
                    <TableCell>{getMetricBadge(run.accuracy, "accuracy")}</TableCell>
                    <TableCell>{getMetricBadge(run.hallucinationRate, "hallucination")}</TableCell>
                    <TableCell>{getMetricBadge(run.toxicity, "toxicity")}</TableCell>
                    <TableCell><div className="flex items-center gap-1"><DollarSign className="h-3 w-3 text-muted-foreground" /><span className="text-sm">{run.costUSD.toFixed(2)}</span></div></TableCell>
                    <TableCell><div className="flex items-center gap-1"><Clock className="h-3 w-3 text-muted-foreground" /><span className="text-sm">{Math.round(run.durationMs / 1000)}s</span></div></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{run.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <CreateEvalSetModal open={showCreateModal} onOpenChange={setShowCreateModal} />
      <EvalDetailModal evalSet={selectedEvalSet} open={!!selectedEvalSet} onOpenChange={(open) => !open && setSelectedEvalSet(null)} />
    </div>
  )
}
