"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ConnectorCard } from "@/components/ui/connector-card"
import { AddSourceModal } from "@/components/add-source-modal"
import { SourceDetailModal } from "@/components/source-detail-modal"
import { Plus, Search, Filter } from "lucide-react"
import type { Connector } from "@/lib/types"

export default function SourcesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedSource, setSelectedSource] = useState<Connector | null>(null)
  const [connectors, setConnectors] = useState<Connector[]>([])
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
      const res = await fetch('/api/me/project')
      const meData = await parseJsonSafely(res)
      const project = meData?.project
      if (!project?.id) return
      setProjectId(project.id)
      const s = await fetch(`/api/sources/status?projectId=${project.id}`)
      const data = await parseJsonSafely(s)
      const mapped: Connector[] = ((data?.sources as any[]) || []).map((row: any) => ({ id: row.id, name: row.name, status: row.status, lastSyncAt: row.last_sync_at ? new Date(row.last_sync_at) : undefined, icon: row.type }))
      setConnectors(mapped)
    })()
  }, [])

  const filteredConnectors = useMemo(() => connectors.filter((connector) => {
    const matchesSearch = connector.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || connector.status === statusFilter
    return matchesSearch && matchesStatus
  }), [connectors, searchQuery, statusFilter])

  const handleConnect = async (connectorId: string) => {
    if (!projectId) return
    const c = connectors.find(c => c.id === connectorId)
    if (!c) return
    setConnectors((prev) => prev.map((conn) => (conn.id === connectorId ? { ...conn, status: "syncing" as const } : conn)))
    await fetch('/api/sources/connect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, sourceId: connectorId, type: c.icon, name: c.name, config: {} }) })
    await fetch('/api/sources/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, sourceId: connectorId }) })
    const s = await fetch(`/api/sources/status?projectId=${projectId}`)
    const data = await parseJsonSafely(s)
    const mapped: Connector[] = ((data?.sources as any[]) || []).map((row: any) => ({ id: row.id, name: row.name, status: row.status, lastSyncAt: row.last_sync_at ? new Date(row.last_sync_at) : undefined, icon: row.type }))
    setConnectors(mapped)
  }

  const statusCounts = {
    all: connectors.length,
    connected: connectors.filter((c) => c.status === "connected").length,
    error: connectors.filter((c) => c.status === "error").length,
    disconnected: connectors.filter((c) => c.status === "disconnected").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Sources</h1>
          <p className="text-muted-foreground">Connect and manage your data sources</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus className="mr-2 h-4 w-4" />
          Add Source
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{statusCounts.all}</div>
            <p className="text-xs text-muted-foreground">Total Sources</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{statusCounts.connected}</div>
            <p className="text-xs text-muted-foreground">Connected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{connectors.filter(c => c.status === 'error').length}</div>
            <p className="text-xs text-muted-foreground">Errors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-500">{statusCounts.disconnected}</div>
            <p className="text-xs text-muted-foreground">Disconnected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-1">
            {Object.entries(statusCounts).map(([status, count]) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status} ({count})
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Connector Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredConnectors.map((connector) => (
          <ConnectorCard
            key={connector.id}
            connector={connector}
            onConnect={() => handleConnect(connector.id)}
            onConfigure={() => setSelectedSource(connector)}
          />
        ))}
      </div>

      {filteredConnectors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No sources found matching your criteria.</p>
          <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setShowAddModal(true)}>
            Add Your First Source
          </Button>
        </div>
      )}

      {/* Modals */}
      <AddSourceModal open={showAddModal} onOpenChange={setShowAddModal} projectId={projectId} onCreated={async () => {
        if (!projectId) return
        const s = await fetch(`/api/sources/status?projectId=${projectId}`)
        const data = await parseJsonSafely(s)
        const mapped: Connector[] = ((data?.sources as any[]) || []).map((row: any) => ({ id: row.id, name: row.name, status: row.status, lastSyncAt: row.last_sync_at ? new Date(row.last_sync_at) : undefined, icon: row.type }))
        setConnectors(mapped)
      }} />
      <SourceDetailModal
        source={selectedSource}
        open={!!selectedSource}
        onOpenChange={(open) => !open && setSelectedSource(null)}
      />
    </div>
  )
}
