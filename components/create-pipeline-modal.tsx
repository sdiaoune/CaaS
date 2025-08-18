"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, ArrowLeft, CheckCircle, Database, Zap, Shield, FileOutput } from "lucide-react"

interface CreatePipelineModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const steps = [
  { id: 1, title: "Sources & Chunking", icon: Database },
  { id: 2, title: "Embedding & Vector Store", icon: Zap },
  { id: 3, title: "Retrieval & Guardrails", icon: Shield },
  { id: 4, title: "Output Format", icon: FileOutput },
]

export function CreatePipelineModal({ open, onOpenChange }: CreatePipelineModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [pipelineData, setPipelineData] = useState({
    name: "",
    sources: [] as string[],
    chunkingStrategy: "semantic",
    embeddingModel: "text-embedding-ada-002",
    vectorStore: "pinecone",
    retrievalK: 5,
    reranker: "cross-encoder-ms-marco",
    guardrails: [] as string[],
    outputFormat: "json",
  })

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    try {
      const me = await fetch('/api/me/project')
      const { project } = await me.json()
      if (project?.id) {
        await fetch('/api/pipelines/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: project.id, name: pipelineData.name, indexName: '', reranker: pipelineData.reranker, guardrails: pipelineData.guardrails, config: { retrievalK: pipelineData.retrievalK, chunking: pipelineData.chunkingStrategy, embeddingModel: pipelineData.embeddingModel, vectorStore: pipelineData.vectorStore } })
        })
      }
    } finally {
      onOpenChange(false)
      setCurrentStep(1)
      setPipelineData({
        name: "",
        sources: [],
        chunkingStrategy: "semantic",
        embeddingModel: "text-embedding-ada-002",
        vectorStore: "pinecone",
        retrievalK: 5,
        reranker: "cross-encoder-ms-marco",
        guardrails: [],
        outputFormat: "json",
      })
    }
  }

  const availableSources = ["Google Drive", "Notion", "Confluence", "GitHub"]
  const availableGuardrails = ["PII Detection", "Toxicity Filter", "Jailbreak Protection", "Content Policy"]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create RAG Pipeline</DialogTitle>
          <DialogDescription>Build a new retrieval-augmented generation pipeline</DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const StepIcon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 ${isActive ? "text-accent" : isCompleted ? "text-green-600" : "text-muted-foreground"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      isActive
                        ? "border-accent bg-accent/10"
                        : isCompleted
                          ? "border-green-600 bg-green-50 dark:bg-green-900"
                          : "border-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                  </div>
                  <span className="text-sm font-medium">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-px mx-4 ${isCompleted ? "bg-green-600" : "bg-muted"}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="pipeline-name">Pipeline Name</Label>
                <Input
                  id="pipeline-name"
                  placeholder="e.g., Customer Support RAG"
                  value={pipelineData.name}
                  onChange={(e) => setPipelineData((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Select Data Sources</Label>
                <div className="grid md:grid-cols-2 gap-3 mt-2">
                  {availableSources.map((source) => (
                    <Card
                      key={source}
                      className={`cursor-pointer transition-colors ${
                        pipelineData.sources.includes(source) ? "ring-2 ring-accent" : "hover:bg-muted/50"
                      }`}
                      onClick={() => {
                        setPipelineData((prev) => ({
                          ...prev,
                          sources: prev.sources.includes(source)
                            ? prev.sources.filter((s) => s !== source)
                            : [...prev.sources, source],
                        }))
                      }}
                    >
                      <CardContent className="flex items-center justify-between p-4">
                        <span>{source}</span>
                        {pipelineData.sources.includes(source) && <CheckCircle className="h-4 w-4 text-accent" />}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <Label>Chunking Strategy</Label>
                <div className="grid md:grid-cols-3 gap-3 mt-2">
                  {[
                    { id: "semantic", name: "Semantic", desc: "AI-powered semantic chunking" },
                    { id: "fixed", name: "Fixed Size", desc: "Fixed token-based chunks" },
                    { id: "recursive", name: "Recursive", desc: "Hierarchical text splitting" },
                  ].map((strategy) => (
                    <Card
                      key={strategy.id}
                      className={`cursor-pointer transition-colors ${
                        pipelineData.chunkingStrategy === strategy.id ? "ring-2 ring-accent" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setPipelineData((prev) => ({ ...prev, chunkingStrategy: strategy.id }))}
                    >
                      <CardContent className="p-4 text-center">
                        <h3 className="font-medium">{strategy.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{strategy.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label>Embedding Model</Label>
                <select
                  value={pipelineData.embeddingModel}
                  onChange={(e) => setPipelineData((prev) => ({ ...prev, embeddingModel: e.target.value }))}
                  className="w-full p-2 border border-border rounded-md bg-background mt-1"
                >
                  <option value="text-embedding-ada-002">OpenAI Ada-002</option>
                  <option value="text-embedding-3-small">OpenAI Embedding-3-Small</option>
                  <option value="text-embedding-3-large">OpenAI Embedding-3-Large</option>
                  <option value="sentence-transformers">Sentence Transformers</option>
                </select>
              </div>

              <div>
                <Label>Vector Store</Label>
                <div className="grid md:grid-cols-3 gap-3 mt-2">
                  {[
                    { id: "pinecone", name: "Pinecone", desc: "Managed vector database" },
                    { id: "weaviate", name: "Weaviate", desc: "Open-source vector search" },
                    { id: "chroma", name: "Chroma", desc: "AI-native embedding database" },
                  ].map((store) => (
                    <Card
                      key={store.id}
                      className={`cursor-pointer transition-colors ${
                        pipelineData.vectorStore === store.id ? "ring-2 ring-accent" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setPipelineData((prev) => ({ ...prev, vectorStore: store.id }))}
                    >
                      <CardContent className="p-4 text-center">
                        <h3 className="font-medium">{store.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{store.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Vector Store Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="index-name">Index Name</Label>
                    <Input id="index-name" placeholder="customer-support-v1" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="dimensions">Dimensions</Label>
                    <Input id="dimensions" type="number" defaultValue="1536" className="mt-1" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Retrieval Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="retrieval-k">Number of Documents (k)</Label>
                      <Input
                        id="retrieval-k"
                        type="number"
                        value={pipelineData.retrievalK}
                        onChange={(e) =>
                          setPipelineData((prev) => ({ ...prev, retrievalK: Number.parseInt(e.target.value) }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Reranker Model</Label>
                      <select
                        value={pipelineData.reranker}
                        onChange={(e) => setPipelineData((prev) => ({ ...prev, reranker: e.target.value }))}
                        className="w-full p-2 border border-border rounded-md bg-background mt-1"
                      >
                        <option value="cross-encoder-ms-marco">Cross-Encoder MS MARCO</option>
                        <option value="bge-reranker-large">BGE Reranker Large</option>
                        <option value="cohere-rerank">Cohere Rerank</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Guardrails</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {availableGuardrails.map((guardrail) => (
                        <div key={guardrail} className="flex items-center space-x-2">
                          <Checkbox
                            id={guardrail}
                            checked={pipelineData.guardrails.includes(guardrail)}
                            onCheckedChange={(checked) => {
                              setPipelineData((prev) => ({
                                ...prev,
                                guardrails: checked
                                  ? [...prev.guardrails, guardrail]
                                  : prev.guardrails.filter((g) => g !== guardrail),
                              }))
                            }}
                          />
                          <Label htmlFor={guardrail} className="text-sm">
                            {guardrail}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <Label>Output Format</Label>
                <div className="grid md:grid-cols-2 gap-3 mt-2">
                  {[
                    { id: "json", name: "JSON", desc: "Structured JSON response" },
                    { id: "markdown", name: "Markdown", desc: "Formatted markdown text" },
                  ].map((format) => (
                    <Card
                      key={format.id}
                      className={`cursor-pointer transition-colors ${
                        pipelineData.outputFormat === format.id ? "ring-2 ring-accent" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setPipelineData((prev) => ({ ...prev, outputFormat: format.id }))}
                    >
                      <CardContent className="p-4 text-center">
                        <h3 className="font-medium">{format.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{format.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Pipeline Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span>{pipelineData.name || "Untitled Pipeline"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sources:</span>
                    <div className="flex gap-1">
                      {pipelineData.sources.map((source) => (
                        <Badge key={source} variant="outline" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Embedding:</span>
                    <span>{pipelineData.embeddingModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vector Store:</span>
                    <span className="capitalize">{pipelineData.vectorStore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guardrails:</span>
                    <span>{pipelineData.guardrails.length} enabled</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={currentStep === 1 ? () => onOpenChange(false) : handlePrevious}>
            {currentStep === 1 ? (
              "Cancel"
            ) : (
              <>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </>
            )}
          </Button>
          <Button
            onClick={currentStep === steps.length ? handleComplete : handleNext}
            disabled={currentStep === 1 && (!pipelineData.name || pipelineData.sources.length === 0)}
          >
            {currentStep === steps.length ? (
              "Create Pipeline"
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
