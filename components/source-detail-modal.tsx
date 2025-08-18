"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Clock, Play, Trash2 } from "lucide-react"
import type { Connector } from "@/lib/types"

interface SourceDetailModalProps {
  source: Connector | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SourceDetailModal({ source, open, onOpenChange }: SourceDetailModalProps) {
  if (!source) return null

  const statusConfig = {
    connected: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950" },
    syncing: { icon: Clock, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
    error: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950" },
    disconnected: { icon: AlertCircle, color: "text-gray-400", bg: "bg-gray-50 dark:bg-gray-950" },
  }

  const config = statusConfig[source.status]
  const StatusIcon = config.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-sm font-medium">{source.name.charAt(0)}</span>
            </div>
            <div>
              <DialogTitle>{source.name}</DialogTitle>
              <DialogDescription>Manage connection settings and sync preferences</DialogDescription>
            </div>
            <Badge variant="outline" className={`gap-1 ml-auto ${config.bg} ${config.color}`}>
              <StatusIcon className="h-3 w-3" />
              {source.status}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sync">Sync Settings</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Connection Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant="outline" className={`gap-1 ${config.bg} ${config.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {source.status}
                    </Badge>
                  </div>
                  {source.lastSyncAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Sync:</span>
                      <span className="text-sm">{source.lastSyncAt.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Next Sync:</span>
                    <span className="text-sm">In 45 minutes</span>
                  </div>
                  {source.errors && source.errors.length > 0 && (
                    <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950 p-2 rounded">{source.errors[0]}</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sync Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Documents:</span>
                    <span className="text-sm font-medium">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Size:</span>
                    <span className="text-sm font-medium">2.4 GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Indexed:</span>
                    <span className="text-sm font-medium">1,198</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Errors:</span>
                    <span className="text-sm font-medium text-red-600">49</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-2">
              <Button className="gap-2">
                <Play className="h-4 w-4" />
                Run Manual Sync
              </Button>
              <Button variant="outline">View Sync Logs</Button>
            </div>
          </TabsContent>

          <TabsContent value="sync" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sync Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sync-frequency">Sync Frequency</Label>
                  <select
                    id="sync-frequency"
                    className="w-full p-2 border border-border rounded-md bg-background"
                    defaultValue="hourly"
                  >
                    <option value="realtime">Real-time</option>
                    <option value="hourly">Every hour</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sync-time">Preferred Sync Time</Label>
                  <Input id="sync-time" type="time" defaultValue="02:00" className="w-full" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-sync">Auto-sync enabled</Label>
                    <p className="text-xs text-muted-foreground">Automatically sync when changes are detected</p>
                  </div>
                  <Switch id="auto-sync" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="filters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Inclusion Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="include-paths">Include Paths</Label>
                  <Input
                    id="include-paths"
                    placeholder="/Documents/*, /Shared/*"
                    defaultValue="/Documents/Knowledge Base/*"
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of paths to include. Use * for wildcards.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file-types">File Types</Label>
                  <Input id="file-types" placeholder="pdf, docx, txt, md" defaultValue="pdf, docx, txt, md, pptx" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Exclusion Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="exclude-paths">Exclude Paths</Label>
                  <Input id="exclude-paths" placeholder="/Temp/*, /Archive/*" defaultValue="/Temp/*, /Personal/*" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exclude-patterns">Exclude Patterns</Label>
                  <Input id="exclude-patterns" placeholder="*.tmp, ~*, .DS_Store" defaultValue="*.tmp, ~*, .DS_Store" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Privacy & Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pii-redaction">PII Redaction</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically detect and redact personal information
                    </p>
                  </div>
                  <Switch id="pii-redaction" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="content-filtering">Content Filtering</Label>
                    <p className="text-xs text-muted-foreground">Filter out inappropriate or sensitive content</p>
                  </div>
                  <Switch id="content-filtering" defaultChecked />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Access Permissions</Label>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Read access to files and folders</p>
                    <p>• View file metadata and permissions</p>
                    <p>• Receive notifications for file changes</p>
                  </div>
                </div>

                <Button variant="outline" className="w-full text-red-600 hover:text-red-700 bg-transparent">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Revoke Access & Delete Source
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
