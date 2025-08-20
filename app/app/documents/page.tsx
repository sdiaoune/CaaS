"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { DocumentDrawer } from "@/components/document-drawer"
import { Search, Filter, MoreHorizontal, RefreshCw, Trash2, Eye, AlertTriangle } from "lucide-react"
import type { Document } from "@/lib/types"

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 20
  const [projectId, setProjectId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

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
      if (project?.id) setProjectId(project.id)
    })()
  }, [])

  useEffect(() => {
    if (!projectId) return
    ;(async () => {
      const res = await fetch(`/api/documents/list?projectId=${projectId}&search=${encodeURIComponent(searchQuery)}&status=${statusFilter}&page=${page}&pageSize=${pageSize}`)
      const data = await parseJsonSafely(res)
      setDocuments((data?.items as Document[]) || [])
      setTotal((data?.total as number) || 0)
    })()
  }, [projectId, searchQuery, statusFilter, page])

  const filteredDocuments = documents
  const sources = Array.from(new Set(documents.map((doc) => doc.source)))
  const statusCounts = {
    all: total,
    indexed: documents.filter((d) => d.status === "indexed").length,
    processing: documents.filter((d) => d.status === "processing").length,
    error: documents.filter((d) => d.status === "error").length,
  }

  const handleSelectAll = (checked: boolean) => { setSelectedDocs(checked ? filteredDocuments.map((doc) => doc.id) : []) }
  const handleSelectDoc = (docId: string, checked: boolean) => { setSelectedDocs((prev) => (checked ? [...prev, docId] : prev.filter((id) => id !== docId))) }

  const getStatusBadge = (status: Document["status"]) => {
    const config = {
      indexed: { variant: "default" as const, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      processing: { variant: "secondary" as const, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
      error: { variant: "destructive" as const, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
    }
    return (<Badge variant={config[status].variant} className={config[status].color}>{status}</Badge>)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground">Manage your indexed documents and content</p>
        </div>
        <Button variant="outline" onClick={() => setPage(1)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Index
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{statusCounts.all}</div><p className="text-xs text-muted-foreground">Total Documents</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-green-600">{statusCounts.indexed}</div><p className="text-xs text-muted-foreground">Indexed</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-blue-600">{statusCounts.processing}</div><p className="text-xs text-muted-foreground">Processing</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-red-600">{statusCounts.error}</div><p className="text-xs text-muted-foreground">Errors</p></CardContent></Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search documents..." value={searchQuery} onChange={(e) => { setPage(1); setSearchQuery(e.target.value) }} className="pl-10" />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value) }} className="px-3 py-1 border border-border rounded-md bg-background text-sm">
            <option value="all">All Status</option>
            <option value="indexed">Indexed</option>
            <option value="processing">Processing</option>
            <option value="error">Error</option>
          </select>

          <select value="all" disabled className="px-3 py-1 border border-border rounded-md bg-background text-sm">
            <option value="all">All Sources</option>
            {sources.map((source) => (<option key={source} value={source}>{source}</option>))}
          </select>
        </div>

        {selectedDocs.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selectedDocs.length} selected</span>
            <Button size="sm" variant="outline" onClick={async ()=>{
              if (!projectId) return
              for (const id of selectedDocs) {
                await fetch(`/api/documents/${id}/reindex`, { method: 'POST' })
              }
              const res = await fetch(`/api/documents/list?projectId=${projectId}&search=${encodeURIComponent(searchQuery)}&status=${statusFilter}&page=${page}&pageSize=${pageSize}`)
              const data = await parseJsonSafely(res)
              setDocuments((data?.items as Document[]) || [])
              setTotal((data?.total as number) || 0)
              setSelectedDocs([])
            }}><RefreshCw className="h-3 w-3 mr-1" />Re-index</Button>
            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 bg-transparent" onClick={async ()=>{
              if (!projectId) return
              for (const id of selectedDocs) {
                await fetch(`/api/documents/${id}`, { method: 'DELETE' })
              }
              const res = await fetch(`/api/documents/list?projectId=${projectId}&search=${encodeURIComponent(searchQuery)}&status=${statusFilter}&page=${page}&pageSize=${pageSize}`)
              const data = await parseJsonSafely(res)
              setDocuments((data?.items as Document[]) || [])
              setTotal((data?.total as number) || 0)
              setSelectedDocs([])
            }}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <input id="doc-file-input" type="file" accept=".txt,.md,.markdown,.json,.csv" multiple className="hidden" onChange={async (e) => {
            if (!projectId) return
            const files = Array.from(e.target.files || [])
            setIsUploading(true)
            try {
              for (const file of files) {
                try {
                  const create = await fetch('/api/uploads/createSignedUrl', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, fileName: file.name }) })
                  const uploadInfo = await parseJsonSafely(create)
                  if (uploadInfo?.signedUrl) {
                    const headers: any = { 'Content-Type': file.type || 'application/octet-stream' }
                    if (uploadInfo?.token) headers['Authorization'] = `Bearer ${uploadInfo.token}`
                    await fetch(uploadInfo.signedUrl, { method: 'PUT', headers, body: file })
                  }
                  const text = await file.text()
                  await fetch('/api/ingest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, title: file.name, text }) })
                } catch {}
              }
              const res = await fetch(`/api/documents/list?projectId=${projectId}&search=${encodeURIComponent(searchQuery)}&status=${statusFilter}&page=${page}&pageSize=${pageSize}`)
              const data = await parseJsonSafely(res)
              setDocuments((data?.items as Document[]) || [])
              setTotal((data?.total as number) || 0)
            } finally {
              setIsUploading(false)
              ;(document.getElementById('doc-file-input') as HTMLInputElement)?.value && ((document.getElementById('doc-file-input') as HTMLInputElement).value = '')
            }
          }} />
          <Button variant="outline" onClick={() => (document.getElementById('doc-file-input') as HTMLInputElement)?.click?.()} disabled={isUploading}>{isUploading ? 'Uploading…' : 'Upload Files'}</Button>
        </div>
      </div>

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"><Checkbox checked={selectedDocs.length === filteredDocuments.length && filteredDocuments.length > 0} onCheckedChange={handleSelectAll} /></TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Ingress Date</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>PII Flags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell><Checkbox checked={selectedDocs.includes(doc.id)} onCheckedChange={(checked) => handleSelectDoc(doc.id, !!checked)} /></TableCell>
                  <TableCell><div className="font-medium">{doc.title}</div></TableCell>
                  <TableCell>{doc.source}</TableCell>
                  <TableCell>{doc.ingressDate.toLocaleDateString()}</TableCell>
                  <TableCell>{doc.tokens.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {doc.piiFlags.length > 0 ? (
                        doc.piiFlags.map((flag) => (
                          <Badge key={flag} variant="outline" className="text-xs bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><AlertTriangle className="h-2 w-2 mr-1" />{flag}</Badge>
                        ))
                      ) : (
                        <Badge variant="outline" className="text-xs">Clean</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(doc.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedDocument(doc)}><Eye className="h-4 w-4 mr-2" />View Details</DropdownMenuItem>
                        <DropdownMenuItem><RefreshCw className="h-4 w-4 mr-2" />Re-index</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Simple pagination */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Page {page} • {total} total</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
          <Button size="sm" variant="outline" onClick={() => setPage((p) => (documents.length < pageSize ? p : p + 1))} disabled={documents.length < pageSize}>Next</Button>
        </div>
      </div>

      {/* Document Drawer */}
      <DocumentDrawer document={selectedDocument} open={!!selectedDocument} onOpenChange={(open) => !open && setSelectedDocument(null)} />
    </div>
  )
}
