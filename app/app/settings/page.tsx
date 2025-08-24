"use client"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent } from "@/components/ui/card"
import { CardDescription } from "@/components/ui/card"
import { CardTitle } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs"
export default function SettingsPage() {
  const [projectId, setProjectId] = useState<string | null>(null)
  const [piiRedaction, setPiiRedaction] = useState(false)
  const [allowedSources, setAllowedSources] = useState<string>("")
  const [profanityLevel, setProfanityLevel] = useState("medium")

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
      if (data?.policy) {
        setPiiRedaction(!!data.policy.pii_redaction)
        setAllowedSources((data.policy.allowed_sources || []).join(','))
        setProfanityLevel(data.policy.profanity_level || 'medium')
      }
    })()
  }, [])
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your project settings, API keys, and team access.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
              <CardDescription>Configure your project name and basic settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input id="project-name" defaultValue="My RAG Project" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project-description">Description</Label>
                <Input id="project-description" defaultValue="Customer support knowledge base" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="auto-sync" defaultChecked />
                <Label htmlFor="auto-sync">Enable automatic syncing</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="pii-detection" checked={piiRedaction} onCheckedChange={(v)=> setPiiRedaction(!!v)} />
                <Label htmlFor="pii-detection">Enable PII redaction</Label>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="allowed-sources">Allowed Sources (comma-separated)</Label>
                <Input id="allowed-sources" value={allowedSources} onChange={(e)=> setAllowedSources(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profanity">Profanity Level</Label>
                <select id="profanity" className="w-full p-2 border border-border rounded-md bg-background" value={profanityLevel} onChange={(e)=> setProfanityLevel(e.target.value)}>
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={async ()=>{
                if (!projectId) return
                await fetch('/api/governance', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ projectId, pii_redaction: piiRedaction, allowed_sources: allowedSources.split(',').map(s=>s.trim()).filter(Boolean), profanity_level: profanityLevel }) })
              }}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage API keys for accessing your RAG endpoints.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Production Key",
                    key: "caas_prod_••••••••••••••••",
                    created: "2024-01-15",
                    lastUsed: "2 hours ago",
                  },
                  {
                    name: "Development Key",
                    key: "caas_dev_••••••••••••••••",
                    created: "2024-01-10",
                    lastUsed: "1 day ago",
                  },
                ].map((apiKey, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{apiKey.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">{apiKey.key}</p>
                      <p className="text-xs text-muted-foreground">
                        Created {apiKey.created} • Last used {apiKey.lastUsed}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Copy
                      </Button>
                      <Button variant="outline" size="sm">
                        Revoke
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button>Create New Key</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage team access and permissions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "John Doe", email: "john@company.com", role: "Owner", status: "Active" },
                  { name: "Jane Smith", email: "jane@company.com", role: "Admin", status: "Active" },
                  { name: "Bob Wilson", email: "bob@company.com", role: "Member", status: "Pending" },
                ].map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={member.status === "Active" ? "default" : "secondary"}>{member.status}</Badge>
                      <span className="text-sm text-muted-foreground">{member.role}</span>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button>Invite Member</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Usage</CardTitle>
              <CardDescription>Monitor your usage and manage billing settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="text-2xl font-bold">Pro</p>
                  <p className="text-sm text-muted-foreground">$99/month</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Documents Indexed</p>
                  <p className="text-2xl font-bold">12,450</p>
                  <p className="text-sm text-muted-foreground">of 50,000</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">API Calls</p>
                  <p className="text-2xl font-bold">89,234</p>
                  <p className="text-sm text-muted-foreground">this month</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                      VISA
                    </div>
                    <span>•••• •••• •••• 4242</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline">Download Invoice</Button>
              <Button variant="outline">Upgrade Plan</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security & Compliance</CardTitle>
              <CardDescription>Configure security settings and compliance features.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Audit Logging</p>
                    <p className="text-sm text-muted-foreground">Track all system activities</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Data Encryption</p>
                    <p className="text-sm text-muted-foreground">Encrypt data at rest and in transit</p>
                  </div>
                  <Switch defaultChecked disabled />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">GDPR Compliance</p>
                    <p className="text-sm text-muted-foreground">Enable GDPR data handling</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Data Retention Period</Label>
                <select className="w-full p-2 border rounded-md" defaultValue="1 year">
                  <option>30 days</option>
                  <option>90 days</option>
                  <option>1 year</option>
                  <option>2 years</option>
                </select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Security Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
