import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Code, Zap, Shield, BarChart3, ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="font-bold text-accent-foreground">C</span>
            </div>
            <span className="font-semibold text-xl">CaaS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/pricing" className="text-sm hover:text-accent transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm text-accent font-medium">
              Docs
            </Link>
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Button size="sm">Start Free</Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Documentation</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Everything you need to build production-ready RAG applications with CaaS.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Quick Start Guide
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              API Reference
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Getting Started */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-accent mb-2" />
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Learn the basics of CaaS and get your first RAG pipeline running in minutes.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="#" className="text-accent hover:underline">
                      Quick Start
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-accent hover:underline">
                      Core Concepts
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-accent hover:underline">
                      First Pipeline
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-accent hover:underline">
                      Authentication
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Sources */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="h-8 w-8 text-accent mb-2" />
                <CardTitle>Data Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Connect and configure your data sources for optimal ingestion and processing.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="#" className="text-accent hover:underline">
                      Supported Connectors
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-accent hover:underline">
                      OAuth Setup
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-accent hover:underline">
                      Sync Schedules
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-accent hover:underline">
                      Custom Connectors
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Pipelines */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Code className="h-8 w-8 text-accent mb-2" />
                <CardTitle>RAG Pipelines</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Build and deploy sophisticated retrieval-augmented generation pipelines.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="#" className="text-accent hover:underline">
                      Pipeline Architecture
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-accent hover:underline">
                      Chunking Strategies
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-accent hover:underline">
                      Embedding Models
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-accent hover:underline">
                      Reranking
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Governance */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-8 w-8 text-accent mb-2" />
                <CardTitle>Governance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Implement security, compliance, and content governance for enterprise deployments.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="#" className="text-accent hover:underline">
                      PII Detection
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-accent hover:underline">
                      Content Filtering
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-accent hover:underline">
                      Access Controls
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-accent hover:underline">
                      Audit Logs
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Evaluation */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-accent mb-2" />
                <CardTitle>Evaluation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Monitor and improve your RAG system performance with comprehensive evaluation tools.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="#" className="text-accent hover:underline">
                      Evaluation Metrics
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-accent hover:underline">
                      Test Sets
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-accent hover:underline">
                      A/B Testing
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-accent hover:underline">
                      Monitoring
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* API Reference */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Code className="h-8 w-8 text-accent mb-2" />
                <CardTitle>API Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Complete API documentation with examples and SDKs for popular languages.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="#" className="text-accent hover:underline">
                      REST API
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-accent hover:underline">
                      Python SDK
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-accent hover:underline">
                      JavaScript SDK
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-accent hover:underline">
                      Webhooks
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Guides */}
      <section className="container mx-auto px-4 py-16 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Guides</h2>
          <div className="space-y-6">
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <h3 className="font-semibold mb-2">Building Your First RAG Application</h3>
                  <p className="text-muted-foreground text-sm">
                    A step-by-step tutorial to create a customer support chatbot using CaaS.
                  </p>
                  <Badge variant="outline" className="mt-2">
                    15 min read
                  </Badge>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <h3 className="font-semibold mb-2">Advanced Chunking Strategies</h3>
                  <p className="text-muted-foreground text-sm">
                    Optimize your document processing for better retrieval performance.
                  </p>
                  <Badge variant="outline" className="mt-2">
                    10 min read
                  </Badge>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <h3 className="font-semibold mb-2">Enterprise Security Best Practices</h3>
                  <p className="text-muted-foreground text-sm">
                    Implement governance and security controls for production deployments.
                  </p>
                  <Badge variant="outline" className="mt-2">
                    12 min read
                  </Badge>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Need help?</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Can't find what you're looking for? Our support team is here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline">Join Community</Button>
          <Button>Contact Support</Button>
        </div>
      </section>
    </div>
  )
}
