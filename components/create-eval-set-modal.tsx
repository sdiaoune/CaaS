"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Plus, Trash2, FileText } from "lucide-react"

interface CreateEvalSetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface EvalItem {
  id: string
  query: string
  expectedAnswer: string
  context?: string
}

export function CreateEvalSetModal({ open, onOpenChange }: CreateEvalSetModalProps) {
  const [evalSetData, setEvalSetData] = useState({
    name: "",
    domain: "",
    description: "",
  })
  const [evalItems, setEvalItems] = useState<EvalItem[]>([])
  const [currentItem, setCurrentItem] = useState({
    query: "",
    expectedAnswer: "",
    context: "",
  })

  const handleAddItem = () => {
    if (!currentItem.query.trim() || !currentItem.expectedAnswer.trim()) return

    const newItem: EvalItem = {
      id: Date.now().toString(),
      query: currentItem.query,
      expectedAnswer: currentItem.expectedAnswer,
      context: currentItem.context || undefined,
    }

    setEvalItems([...evalItems, newItem])
    setCurrentItem({ query: "", expectedAnswer: "", context: "" })
  }

  const handleRemoveItem = (id: string) => {
    setEvalItems(evalItems.filter((item) => item.id !== id))
  }

  const handleCreate = async () => {
    try {
      const me = await fetch('/api/me/project')
      const text = await me.text().catch(()=> '')
      const project = text ? (JSON.parse(text)?.project) : null
      if (!project?.id) return
      // Create eval set row
      const res = await fetch('/api/evals/sets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: project.id, name: evalSetData.name, domain: evalSetData.domain, items: evalItems.length, config: { description: evalSetData.description, items: evalItems } }) })
      await res.text().catch(()=> '')
    } finally {
      onOpenChange(false)
      setEvalSetData({ name: "", domain: "", description: "" })
      setEvalItems([])
      setCurrentItem({ query: "", expectedAnswer: "", context: "" })
    }
  }

  const domains = ["support", "product", "technical", "sales", "general"]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Evaluation Set</DialogTitle>
          <DialogDescription>Build a new evaluation set to test your RAG pipeline quality</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="items">Items ({evalItems.length})</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eval-name">Evaluation Set Name</Label>
                <Input
                  id="eval-name"
                  placeholder="e.g., Customer Support QA"
                  value={evalSetData.name}
                  onChange={(e) => setEvalSetData((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="eval-domain">Domain</Label>
                <select
                  id="eval-domain"
                  value={evalSetData.domain}
                  onChange={(e) => setEvalSetData((prev) => ({ ...prev, domain: e.target.value }))}
                  className="w-full p-2 border border-border rounded-md bg-background mt-1"
                >
                  <option value="">Select domain</option>
                  {domains.map((domain) => (
                    <option key={domain} value={domain} className="capitalize">
                      {domain}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="eval-description">Description</Label>
              <Textarea
                id="eval-description"
                placeholder="Describe what this evaluation set tests..."
                value={evalSetData.description}
                onChange={(e) => setEvalSetData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="mt-1"
              />
            </div>
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-medium">Add New Item</h3>
                <div>
                  <Label htmlFor="item-query">Query</Label>
                  <Input
                    id="item-query"
                    placeholder="What question should be asked?"
                    value={currentItem.query}
                    onChange={(e) => setCurrentItem((prev) => ({ ...prev, query: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="item-answer">Expected Answer</Label>
                  <Textarea
                    id="item-answer"
                    placeholder="What should the ideal response be?"
                    value={currentItem.expectedAnswer}
                    onChange={(e) => setCurrentItem((prev) => ({ ...prev, expectedAnswer: e.target.value }))}
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="item-context">Context (Optional)</Label>
                  <Textarea
                    id="item-context"
                    placeholder="Additional context or constraints..."
                    value={currentItem.context}
                    onChange={(e) => setCurrentItem((prev) => ({ ...prev, context: e.target.value }))}
                    rows={2}
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleAddItem}
                  disabled={!currentItem.query.trim() || !currentItem.expectedAnswer.trim()}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {evalItems.map((item, index) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                            {index + 1}
                          </Badge>
                          <span className="font-medium text-sm">Query</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{item.query}</p>
                        <div className="mb-2">
                          <span className="font-medium text-sm">Expected Answer</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.expectedAnswer}</p>
                        {item.context && (
                          <>
                            <div className="mt-2 mb-1">
                              <span className="font-medium text-sm">Context</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{item.context}</p>
                          </>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {evalItems.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2" />
                <p>No items added yet. Add your first evaluation item above.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Import from File</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a CSV or JSON file with your evaluation items
                </p>
                <Button variant="outline">Choose File</Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Expected Format</h4>
                <div className="bg-muted p-3 rounded text-sm font-mono">
                  <div>query,expected_answer,context</div>
                  <div>"How do I reset my password?","Click the forgot password link...","Support context"</div>
                  <div>"What are your hours?","We're open 24/7 for support","Business hours"</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!evalSetData.name || !evalSetData.domain || evalItems.length === 0}>
            Create Evaluation Set
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
