"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, ExternalLink, Search } from "lucide-react"

interface AddSourceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const availableConnectors = [
  { name: "Google Drive", description: "Connect your Google Drive files and folders", popular: true },
  { name: "Notion", description: "Sync your Notion pages and databases", popular: true },
  { name: "Confluence", description: "Import your Confluence spaces and pages", popular: true },
  { name: "SharePoint", description: "Connect Microsoft SharePoint sites", popular: false },
  { name: "GitHub", description: "Sync repositories and documentation", popular: true },
  { name: "Zendesk", description: "Import support articles and tickets", popular: false },
  { name: "Intercom", description: "Connect help center articles", popular: false },
  { name: "Amazon S3", description: "Import files from S3 buckets", popular: false },
]

export function AddSourceModal({ open, onOpenChange }: AddSourceModalProps) {
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null)
  const [step, setStep] = useState<"select" | "configure" | "test">("select")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConnectors = availableConnectors.filter((connector) =>
    connector.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleConnect = () => {
    if (!selectedConnector) return
    setStep("configure")
  }

  const handleConfigure = () => {
    setStep("test")
  }

  const handleComplete = () => {
    onOpenChange(false)
    setStep("select")
    setSelectedConnector(null)
    setSearchQuery("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Data Source</DialogTitle>
          <DialogDescription>Connect a new data source to expand your knowledge base</DialogDescription>
        </DialogHeader>

        {step === "select" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search connectors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid gap-3">
              {filteredConnectors.map((connector) => (
                <Card
                  key={connector.name}
                  className={`cursor-pointer transition-colors ${
                    selectedConnector === connector.name ? "ring-2 ring-accent" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedConnector(connector.name)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-sm font-medium">{connector.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{connector.name}</h3>
                          {connector.popular && <Badge variant="secondary">Popular</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{connector.description}</p>
                      </div>
                    </div>
                    {selectedConnector === connector.name && <CheckCircle className="h-5 w-5 text-accent" />}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleConnect} disabled={!selectedConnector}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === "configure" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-sm font-medium">{selectedConnector?.charAt(0)}</span>
              </div>
              <div>
                <h3 className="font-medium">{selectedConnector}</h3>
                <p className="text-sm text-muted-foreground">Configure connection settings</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">OAuth Authorization</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-3">CaaS will request the following permissions:</p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Read access to files and folders
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      View file metadata and permissions
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Receive notifications for file changes
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
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

              <div className="space-y-3">
                <Label htmlFor="folder-path">Folder Path (Optional)</Label>
                <Input id="folder-path" placeholder="/Documents/Knowledge Base" className="w-full" />
                <p className="text-xs text-muted-foreground">Leave empty to sync all accessible files</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep("select")}>
                Back
              </Button>
              <Button onClick={handleConfigure} className="gap-2">
                Authorize with {selectedConnector}
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {step === "test" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-medium mb-2">Connection Successful!</h3>
              <p className="text-sm text-muted-foreground">
                {selectedConnector} has been connected and is ready to sync.
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Connection Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-green-600">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sync Frequency:</span>
                  <span>Every hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next Sync:</span>
                  <span>In 5 minutes</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleComplete}>
                Done
              </Button>
              <Button onClick={handleComplete}>Start Initial Sync</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
