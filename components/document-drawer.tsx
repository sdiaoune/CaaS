"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, FileText, Hash, Calendar, Database, Copy } from "lucide-react"
import type { Document } from "@/lib/types"

interface DocumentDrawerProps {
  document: Document | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const mockChunks = [
  {
    id: "chunk-1",
    text: "This document outlines the product requirements for Q1 2024, including key features and milestones...",
    tokens: 156,
    embedding: [0.1, 0.2, -0.3, 0.4],
    score: 0.92,
  },
  {
    id: "chunk-2",
    text: "The primary objectives include improving user experience, enhancing performance metrics...",
    tokens: 142,
    embedding: [0.2, -0.1, 0.4, 0.3],
    score: 0.87,
  },
  {
    id: "chunk-3",
    text: "Technical specifications require integration with existing systems and APIs...",
    tokens: 134,
    embedding: [-0.1, 0.3, 0.2, -0.4],
    score: 0.84,
  },
]

const mockEntities = [
  { type: "email", value: "john.doe@company.com", confidence: 0.95 },
  { type: "phone", value: "+1-555-0123", confidence: 0.89 },
  { type: "person", value: "John Doe", confidence: 0.92 },
  { type: "organization", value: "Acme Corp", confidence: 0.88 },
]

export function DocumentDrawer({ document, open, onOpenChange }: DocumentDrawerProps) {
  if (!document) return null

  const getStatusBadge = (status: Document["status"]) => {
    const config = {
      indexed: {
        variant: "default" as const,
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      },
      processing: {
        variant: "secondary" as const,
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      },
      error: { variant: "destructive" as const, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
    }
    return (
      <Badge variant={config[status].variant} className={config[status].color}>
        {status}
      </Badge>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:w-[700px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-lg">{document.title}</SheetTitle>
              <SheetDescription className="flex items-center gap-2 mt-1">
                <Database className="h-3 w-3" />
                {document.source}
                <Separator orientation="vertical" className="h-3" />
                <Calendar className="h-3 w-3" />
                {document.ingressDate.toLocaleDateString()}
              </SheetDescription>
            </div>
            {getStatusBadge(document.status)}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Document Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{document.tokens.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Tokens</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{document.chunks}</div>
                <p className="text-xs text-muted-foreground">Chunks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{document.piiFlags.length}</div>
                <p className="text-xs text-muted-foreground">PII Flags</p>
              </CardContent>
            </Card>
          </div>

          {/* PII Flags */}
          {document.piiFlags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  PII Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {document.piiFlags.map((flag) => (
                    <Badge
                      key={flag}
                      variant="outline"
                      className="bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    >
                      {flag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="chunks">Chunks</TabsTrigger>
              <TabsTrigger value="entities">Entities</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Document Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg text-sm leading-relaxed">
                    <p className="mb-4">
                      This document outlines the comprehensive product requirements for Q1 2024, detailing key features,
                      milestones, and technical specifications that will drive our product development efforts.
                    </p>
                    <p className="mb-4">
                      The primary objectives include improving user experience through enhanced interface design,
                      optimizing performance metrics across all platforms, and implementing robust security measures to
                      protect user data and maintain compliance with industry standards.
                    </p>
                    <p className="text-muted-foreground">
                      [Document continues with detailed specifications and requirements...]
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chunks" className="space-y-4">
              <div className="space-y-3">
                {mockChunks.map((chunk, index) => (
                  <Card key={chunk.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Hash className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Chunk {index + 1}</span>
                          <Badge variant="outline" className="text-xs">
                            {chunk.tokens} tokens
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Score: {chunk.score}
                          </Badge>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm leading-relaxed">{chunk.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="entities" className="space-y-4">
              <div className="space-y-3">
                {mockEntities.map((entity, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="capitalize">
                            {entity.type}
                          </Badge>
                          <span className="font-mono text-sm">{entity.value}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {Math.round(entity.confidence * 100)}% confidence
                          </span>
                          <Button size="sm" variant="ghost">
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
