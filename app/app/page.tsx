"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { KpiCard } from "@/components/ui/kpi-card"
import { CheckCircle, TrendingUp } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import * as Recharts from 'recharts'

export default function DashboardPage() {
  const [kpis, setKpis] = useState<{ label: string; value: string; change?: number; trend?: 'up'|'down'|'neutral' }[]>([])
  const [docsOverTime, setDocsOverTime] = useState<{ date: string; count: number }[]>([])
  const [bySource, setBySource] = useState<{ name: string; count: number }[]>([])
  const [p95, setP95] = useState<number>(0)

  useEffect(() => {
    ;(async () => {
      try {
        const parseJsonSafely = async (res: Response) => {
          const text = await res.text().catch(() => '')
          if (!text) return null
          try { return JSON.parse(text) } catch { return null }
        }

        const me = await fetch('/api/me/project')
        const meData = await parseJsonSafely(me)
        const project = meData?.project
        if (!project?.id) {
          setKpis([
            { label: 'Indexed Docs', value: '0' },
            { label: 'Avg Retrieval Precision', value: '0.000' },
            { label: 'Answer Hallucination Rate', value: '0.0%' },
            { label: 'Latency (p95)', value: '0ms' },
          ])
          return
        }

        const documentsRes = await fetch(`/api/documents/count?projectId=${project.id}`)
        const documentsData = await parseJsonSafely(documentsRes)
        const count = documentsData?.count ?? 0

        const evalsRes = await fetch(`/api/evals/last?projectId=${project.id}`)
        const evalsData = await parseJsonSafely(evalsRes)
        const run = evalsData?.run ?? null

        const [seriesRes, sourceRes, p95Res] = await Promise.all([
          fetch(`/api/dashboard/docsOverTime?projectId=${project.id}&days=30`),
          fetch(`/api/dashboard/bySource?projectId=${project.id}`),
          fetch(`/api/dashboard/evalLatency?projectId=${project.id}&n=200`),
        ])
        const seriesData = await parseJsonSafely(seriesRes)
        const sourceData = await parseJsonSafely(sourceRes)
        const p95Data = await parseJsonSafely(p95Res)
        setDocsOverTime(seriesData?.series || [])
        setBySource(sourceData?.series || [])
        setP95(p95Data?.p95 || 0)

        setKpis([
          { label: 'Indexed Docs', value: String(count ?? 0) },
          { label: 'Avg Retrieval Precision', value: run?.accuracy?.toFixed?.(3) ?? '0.000' },
          { label: 'Answer Hallucination Rate', value: run?.hallucination_rate != null ? `${(run.hallucination_rate*100).toFixed(1)}%` : '0.0%' },
          { label: 'Latency (p95)', value: run?.duration_ms != null ? `${Math.round(run.duration_ms)}ms` : '0ms' },
        ])
      } catch (error) {
        console.error('Failed to load dashboard KPIs', error)
        setKpis([
          { label: 'Indexed Docs', value: '0' },
          { label: 'Avg Retrieval Precision', value: '0.000' },
          { label: 'Answer Hallucination Rate', value: '0.0%' },
          { label: 'Latency (p95)', value: '0ms' },
        ])
      }
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Docs Over Time (30d)</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ count: { label: 'Docs', color: 'hsl(220 70% 50%)' } }} className="h-64">
              <Recharts.AreaChart data={docsOverTime}>
                <Recharts.CartesianGrid strokeDasharray="3 3" />
                <Recharts.XAxis dataKey="date" hide />
                <Recharts.YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Recharts.Area dataKey="count" stroke="var(--color-count)" fill="var(--color-count)" fillOpacity={0.2} />
              </Recharts.AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Docs by Source</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ count: { label: 'Docs', color: 'hsl(140 70% 45%)' } }} className="h-64">
              <Recharts.BarChart data={bySource}>
                <Recharts.CartesianGrid strokeDasharray="3 3" />
                <Recharts.XAxis dataKey="name" interval={0} angle={-20} height={60} tick={{ fontSize: 10 }} />
                <Recharts.YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Recharts.Bar dataKey="count" fill="var(--color-count)" />
              </Recharts.BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Eval Latency p95</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-3xl font-bold">{Math.round(p95)}ms</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
