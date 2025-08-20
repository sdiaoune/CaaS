"use client"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Filter } from "lucide-react"

export default function AuditPage() {
  const [projectId, setProjectId] = useState<string | null>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 20
  const [searchQuery, setSearchQuery] = useState("")
  const [eventFilter, setEventFilter] = useState<string>("all")

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
    })()
  }, [])

  useEffect(() => {
    if (!projectId) return
    ;(async () => {
      const res = await fetch(`/api/audit?projectId=${projectId}&page=${page}&pageSize=${pageSize}`)
      const data = await parseJsonSafely(res)
      let filtered = (data?.logs as any[]) || []
      if (eventFilter !== 'all') filtered = filtered.filter((l: any) => l.event_type === eventFilter)
      if (searchQuery) filtered = filtered.filter((l: any) => JSON.stringify(l).toLowerCase().includes(searchQuery.toLowerCase()))
      setLogs(filtered)
      setTotal((data?.total as number) || filtered.length)
    })()
  }, [projectId, page, eventFilter, searchQuery])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">Track all system activities and security events.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Complete audit trail of all system activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search logs..." className="pl-10" value={searchQuery} onChange={(e)=>{ setPage(1); setSearchQuery(e.target.value) }} />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm">{new Date(log.created_at).toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-sm">{log.actor || 'system'}</TableCell>
                  <TableCell>{log.event_type}</TableCell>
                  <TableCell className="font-mono text-xs break-all">{log.target}</TableCell>
                  <TableCell className="font-mono text-xs">-</TableCell>
                  <TableCell><Badge variant="outline">ok</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-muted-foreground">Page {page} • {total} total</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={()=> setPage(p=> Math.max(1,p-1))} disabled={page===1}>Prev</Button>
              <Button size="sm" variant="outline" onClick={()=> setPage(p=> p+1)} disabled={logs.length < pageSize}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
