import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Filter } from "lucide-react"

export default function AuditPage() {
  const auditLogs = [
    {
      timestamp: "2024-01-20 14:32:15",
      user: "john@company.com",
      action: "Pipeline Created",
      resource: "customer-support-v2",
      ip: "192.168.1.100",
      status: "Success",
    },
    {
      timestamp: "2024-01-20 14:28:42",
      user: "jane@company.com",
      action: "Document Deleted",
      resource: "old-policy.pdf",
      ip: "192.168.1.101",
      status: "Success",
    },
    {
      timestamp: "2024-01-20 14:15:33",
      user: "bob@company.com",
      action: "API Key Generated",
      resource: "prod-key-2024",
      ip: "192.168.1.102",
      status: "Success",
    },
    {
      timestamp: "2024-01-20 13:45:21",
      user: "system",
      action: "Sync Failed",
      resource: "notion-workspace",
      ip: "internal",
      status: "Failed",
    },
    {
      timestamp: "2024-01-20 13:30:18",
      user: "jane@company.com",
      action: "User Invited",
      resource: "alice@company.com",
      ip: "192.168.1.101",
      status: "Success",
    },
  ]

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
              <Input placeholder="Search logs..." className="pl-10" />
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
              {auditLogs.map((log, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell className="font-mono text-sm">{log.resource}</TableCell>
                  <TableCell className="font-mono text-sm">{log.ip}</TableCell>
                  <TableCell>
                    <Badge variant={log.status === "Success" ? "default" : "destructive"}>{log.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
