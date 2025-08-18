"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { KpiCard } from "@/components/ui/kpi-card"
import { CheckCircle, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const [kpis, setKpis] = useState<{ label: string; value: string; change?: number; trend?: 'up'|'down'|'neutral' }[]>([])

  useEffect(() => {
    ;(async () => {
      const me = await fetch('/app/api/me/project')
      const { project } = await me.json()
      if (!project?.id) return
      const documentsRes = await fetch(`/app/api/documents/count?projectId=${project.id}`)
      const { count } = await documentsRes.json()
      const evalsRes = await fetch(`/app/api/evals/last?projectId=${project.id}`)
      const { run } = await evalsRes.json()
      setKpis([
        { label: 'Indexed Docs', value: String(count ?? 0) },
        { label: 'Avg Retrieval Precision', value: run?.accuracy?.toFixed?.(3) ?? '0.000' },
        { label: 'Answer Hallucination Rate', value: run?.hallucination_rate != null ? `${(run.hallucination_rate*100).toFixed(1)}%` : '0.0%' },
        { label: 'Latency (p95)', value: run?.duration_ms != null ? `${Math.round(run.duration_ms)}ms` : '0ms' },
      ])
    })()
  }, [])

  const checklistItems = [
    { id: 1, title: "Connect your first data source", completed: true },
    { id: 2, title: "Create your first pipeline", completed: true },
    { id: 3, title: "Run initial evaluation", completed: false },
    { id: 4, title: "Set up governance policies", completed: false },
    { id: 5, title: "Deploy to production", completed: false },
  ]
  const completedItems = checklistItems.filter((item) => item.completed).length
  const isNewTenant = completedItems < checklistItems.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your RAG system performance and health</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <TrendingUp className="mr-2 h-4 w-4" />
          View Analytics
        </Button>
      </div>

      {/* Get Started Checklist - Only show for new tenants */}
      {isNewTenant && (
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Get Started with CaaS
                  <Badge variant="outline">
                    {completedItems}/{checklistItems.length}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Complete these steps to get the most out of your RAG system</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.completed ? "bg-green-500" : "bg-muted border-2 border-muted-foreground"}`}>
                    {item.completed && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span className={item.completed ? "text-muted-foreground line-through" : ""}>{item.title}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <KpiCard key={index} {...{ label: kpi.label, value: kpi.value, change: kpi.change ?? 0, trend: kpi.trend ?? 'neutral' }} />
        ))}
      </div>
    </div>
  )
}
