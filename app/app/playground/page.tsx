"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Play, Clock, Copy, Settings, Zap, Shield, Database, Target } from "lucide-react"

interface RetrievedChunk { id: string; text: string; source: string; score: number; tokens: number }
interface PlaygroundResponse { answer: string; chunks: RetrievedChunk[]; latency: number; tokens: number; cost: number; trace: { retrieval: { duration: number; count: number }; reranking: { duration: number; scores: number[] }; guardrails: { duration: number; decisions: string[] }; generation: { duration: number; tokens: number } } }

export default function PlaygroundPage() {
  const [query, setQuery] = useState("")
  const [selectedPipeline, setSelectedPipeline] = useState("default")
  const [selectedPersona, setSelectedPersona] = useState("default")
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<PlaygroundResponse | null>(null)

  const handleRunQuery = async () => {
    if (!query.trim()) return
    setIsLoading(true)
    const t0 = performance.now()
    try {
      const me = await fetch('/api/me/project')
      const { project } = await me.json()
      const res = await fetch('/api/answer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: project?.id, query, k: 6 }) })
      const data = await res.json()
      const t1 = performance.now()
      const chunks: RetrievedChunk[] = (data.chunks || []).map((h: any, i: number) => ({ id: String(h.id), text: h.text, source: h.source || `Doc ${i+1}`, score: h.score, tokens: h.tokens || Math.round((h.text?.length || 0)/4) }))
      const answer = data.answer || (chunks.length ? `Based on ${chunks.length} contexts, here is a synthesized answer.` : 'No context found.')
      setResponse({ answer, chunks, latency: data.latency ?? Math.round(t1 - t0), tokens: data.tokens ?? chunks.reduce((a,c)=>a+c.tokens,0), cost: data.cost ?? 0, trace: data.trace || { retrieval: { duration: Math.round(t1 - t0), count: chunks.length }, reranking: { duration: 0, scores: chunks.map(c=>c.score) }, guardrails: { duration: 0, decisions: [] }, generation: { duration: 0, tokens: 0 } } })
    } finally {
      setIsLoading(false)
    }
  }

  const personas = [
    { id: "default", name: "Default", description: "Standard assistant behavior" },
  ]

  const pipelines = [
    { id: "default", name: "Default Pipeline" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Playground</h1>
          <p className="text-muted-foreground">Test and experiment with your RAG pipelines</p>
        </div>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Configure
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Query Input Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Query Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Pipeline</label>
                <select value={selectedPipeline} onChange={(e) => setSelectedPipeline(e.target.value)} className="w-full p-2 border border-border rounded-md bg-background text-sm">
                  {pipelines.map((pipeline) => (<option key={pipeline.id} value={pipeline.id}>{pipeline.name}</option>))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Persona</label>
                <select value={selectedPersona} onChange={(e) => setSelectedPersona(e.target.value)} className="w-full p-2 border border-border rounded-md bg-background text-sm">
                  {personas.map((persona) => (<option key={persona.id} value={persona.id}>{persona.name}</option>))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">{personas.find((p) => p.id === selectedPersona)?.description}</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Query</label>
                <Textarea placeholder="Ask a question about your knowledge base..." value={query} onChange={(e) => setQuery(e.target.value)} rows={4} className="resize-none" />
              </div>

              <Button onClick={handleRunQuery} disabled={!query.trim() || isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                {isLoading ? (<><Clock className="mr-2 h-4 w-4 animate-spin" />Running...</>) : (<><Play className="mr-2 h-4 w-4" />Run Query</>)}
              </Button>
            </CardContent>
          </Card>

          {response && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Query Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Latency:</span><span className="text-sm font-medium">{response.latency}ms</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Tokens:</span><span className="text-sm font-medium">{response.tokens}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Cost:</span><span className="text-sm font-medium">${response.cost.toFixed(4)}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Chunks:</span><span className="text-sm font-medium">{response.chunks.length}</span></div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {!response ? (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center">
                <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Enter a query and click "Run Query" to see results</p>
              </div>
            </Card>
          ) : (
            <Tabs defaultValue="answer" className="space-y-4">
              <TabsList>
                <TabsTrigger value="answer">Answer</TabsTrigger>
                <TabsTrigger value="context">Retrieved Context</TabsTrigger>
                <TabsTrigger value="trace">Trace</TabsTrigger>
              </TabsList>

              <TabsContent value="answer">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      Generated Answer
                      <Button size="sm" variant="ghost"><Copy className="h-3 w-3" /></Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none"><p className="leading-relaxed">{response.answer}</p></div>
                    <Separator className="my-4" />
                    <div>
                      <h4 className="text-sm font-medium mb-2">Citations</h4>
                      <div className="space-y-2">
                        {response.chunks.map((chunk, index) => (
                          <div key={chunk.id} className="flex items-center gap-2 text-xs">
                            <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">{index + 1}</Badge>
                            <span className="text-muted-foreground">{chunk.source}</span>
                            <Badge variant="outline" className="text-xs">{chunk.score.toFixed(2)}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="context">
                <div className="space-y-4">
                  {response.chunks.map((chunk, index) => (
                    <Card key={chunk.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">{index + 1}</Badge>
                            <div>
                              <span className="text-sm font-medium">{chunk.source}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">Score: {chunk.score.toFixed(2)}</Badge>
                                <Badge variant="outline" className="text-xs">{chunk.tokens} tokens</Badge>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost"><Copy className="h-3 w-3" /></Button>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">{chunk.text}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="trace">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4 text-blue-600" />Retrieval</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Duration:</span><span>{response.trace.retrieval.duration}ms</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Documents:</span><span>{response.trace.retrieval.count}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-purple-600" />Reranking</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Duration:</span><span>{response.trace.reranking.duration}ms</span></div>
                        <div><span className="text-sm text-muted-foreground mb-2 block">Scores:</span><div className="flex gap-1">{response.trace.reranking.scores.map((score, index) => (<Badge key={index} variant="outline" className="text-xs">{score.toFixed(2)}</Badge>))}</div></div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-green-600" />Guardrails</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Duration:</span><span>{response.trace.guardrails.duration}ms</span></div>
                        <div><span className="text-sm text-muted-foreground mb-2 block">Decisions:</span><div className="space-y-1"></div></div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-orange-600" />Generation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Duration:</span><span>{response.trace.generation.duration}ms</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Tokens:</span><span>{response.trace.generation.tokens}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}
