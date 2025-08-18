"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Play, TrendingUp, TrendingDown, CheckCircle, XCircle } from "lucide-react"
import type { EvalSet } from "@/lib/types"

interface EvalDetailModalProps {
  evalSet: EvalSet | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const mockResults = [
  {
    id: "item-1",
    query: "How do I reset my password?",
    expected:
      "To reset your password, click the 'Forgot Password' link on the login page, enter your email address, and follow the instructions in the email we send you.",
    actual:
      "You can reset your password by clicking the 'Forgot Password' link on the login page and following the email instructions.",
    score: 0.92,
    status: "pass" as const,
    issues: [],
  },
  {
    id: "item-2",
    query: "What are your business hours?",
    expected:
      "Our customer support is available 24/7 through live chat and email. Phone support is available Monday-Friday 9 AM to 6 PM EST.",
    actual: "We offer 24/7 support via chat and email. Phone support is Monday-Friday 9-6 EST.",
    score: 0.88,
    status: "pass" as const,
    issues: [],
  },
  {
    id: "item-3",
    query: "How much does the premium plan cost?",
    expected:
      "The premium plan costs $99 per month and includes unlimited data sources, advanced evaluation, and priority support.",
    actual: "Premium plan pricing is $149 per month with unlimited sources and priority support.",
    score: 0.45,
    status: "fail" as const,
    issues: ["Incorrect pricing", "Missing feature details"],
  },
]

export function EvalDetailModal({ evalSet, open, onOpenChange }: EvalDetailModalProps) {
  if (!evalSet) return null

  const passRate = mockResults.filter(r => r.status === "pass").length / mockResults.length
  const avgScore = mockResults.reduce((sum, r) => sum + r.score, 0) / mockResults.length

  const getStatusIcon = (status: "pass" | "fail") => {
    return status === "pass" ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    )
  }

  const getScoreBadge = (score: number) => {
    const color = score >= 0.9 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                  score >= 0.7 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                  "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    
    return (
      <Badge variant="outline" className={color}>
        {(score * 100).toFixed(0)}%
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-accent" />
              <div>
                <DialogTitle>{evalSet.name}</DialogTitle>
                <DialogDescription>
                  {evalSet.items} items • {evalSet.domain} domain
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {evalSet.domain}
              </Badge>
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Play className="h-3 w-3 mr-1" />
                Run Eval
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pass Rate:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{(passRate * 100).toFixed(1)}%</span>
                      {passRate >= 0.8 ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Score:</span>
                    <span className="font-medium">{(avgScore * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items:</span>
                    <span className="font-medium">{mockResults.length}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Last Run</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="text-sm">{evalSet.lastRunAt?.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="text-sm">2m 34s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost:</span>
                    <span className="text-sm">$1.23</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Issues</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Failed Items:</span>
                    <span className="font-medium text-red-600">
                      {mockResults.filter(r => r.status === "fail").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Common Issues:</span>
                    <span className="text-sm">Pricing errors</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <div className="space-y-4">
              {mockResults.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className="font-medium">{item.query}</span>
                      {getScoreBadge(item.score)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-muted-foreground text-sm">Expected</span>
                      <p className="text-sm mt-1">{item.expected}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">Actual</span>
                      <p className="text-sm mt-1">{item.actual}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Run History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">2025-08-01</span>
                  <Badge variant="outline">92% pass</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">2025-07-24</span>
                  <Badge variant="outline">88% pass</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

