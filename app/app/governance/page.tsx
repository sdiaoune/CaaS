"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

type Policy = {
  id: string
  project_id: string
  pii_redaction_enabled?: boolean
  toxicity_threshold?: number
  blocked_sources?: string[]
  updated_at?: string
}

export default function GovernancePage() {
  const [projectId, setProjectId] = useState<string | null>(null)
  const [policy, setPolicy] = useState<Policy | null>(null)
  const [saving, setSaving] = useState(false)

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
      const res = await fetch(`/api/governance?projectId=${project.id}`)
      const data = await parseJsonSafely(res)
      setPolicy(data?.policy ?? null)
    })()
  }, [])

  const save = async () => {
    if (!projectId) return
    setSaving(true)
    await fetch('/api/governance', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, pii_redaction_enabled: policy?.pii_redaction_enabled ?? false, toxicity_threshold: policy?.toxicity_threshold ?? 0, blocked_sources: policy?.blocked_sources ?? [] })
    })
    const res = await fetch(`/api/governance?projectId=${projectId}`)
    const data = await parseJsonSafely(res)
    setPolicy(data?.policy ?? null)
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Governance</h1>
          <p className="text-muted-foreground">Configure policies and compliance controls</p>
        </div>
        <Button onClick={save} disabled={!projectId || saving} className="bg-accent hover:bg-accent/90 text-accent-foreground">{saving ? 'Saving...' : 'Save Policies'}</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>PII Redaction</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Enable automatic PII redaction during ingestion</span>
              <Switch checked={!!policy?.pii_redaction_enabled} onCheckedChange={(v) => setPolicy((p) => ({ ...(p || ({} as Policy)), pii_redaction_enabled: !!v }))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Toxicity Threshold</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Input type="number" min={0} max={1} step={0.01} value={policy?.toxicity_threshold ?? 0} onChange={(e) => setPolicy((p) => ({ ...(p || ({} as Policy)), toxicity_threshold: Number(e.target.value) }))} />
              <span className="text-sm text-muted-foreground">0.00 - 1.00</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Blocked Sources</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Comma-separated source IDs"
              value={(policy?.blocked_sources || []).join(',')}
              onChange={(e) => setPolicy((p) => ({ ...(p || ({} as Policy)), blocked_sources: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
            />
            <p className="text-xs text-muted-foreground">Prevent data ingestion from these sources.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


