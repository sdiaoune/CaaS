import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap, Shield, BarChart3, CheckCircle, Users, Building2, Sparkles } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="font-bold text-accent-foreground">C</span>
            </div>
            <span className="font-semibold text-xl">CaaS</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/pricing" className="text-sm hover:text-accent transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm hover:text-accent transition-colors">
              Docs
            </Link>
            <Link href="/signin">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Start Free</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Context is the new code
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Ground your AI in governed, company-specific knowledge to cut hallucinations and ship results you can trust.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/signup">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Start Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline">
            Book Demo
          </Button>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
            <Zap className="h-4 w-4 text-accent" />
            Connect your sources
          </div>
          <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
            <Shield className="h-4 w-4 text-accent" />
            Govern your data
          </div>
          <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
            <BarChart3 className="h-4 w-4 text-accent" />
            Observe retrieval
          </div>
          <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
            <Sparkles className="h-4 w-4 text-accent" />
            Prove quality
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-muted-foreground mb-8">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              <span className="font-semibold">TechCorp</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              <span className="font-semibold">DataFlow</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              <span className="font-semibold">AI Dynamics</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Stop fighting hallucinations</h2>
            <p className="text-muted-foreground mb-6">
              Generic LLMs don't know your business. They make up facts, miss context, and can't access your proprietary
              knowledge.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Connect 20+ data sources instantly</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Automatic PII detection and redaction</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Real-time quality monitoring</span>
              </li>
            </ul>
          </div>
          <div className="bg-muted/50 rounded-lg p-8">
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800">❌ "Our company was founded in 1995..." (Actually 2010)</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-sm text-green-800">
                  ✅ "Based on your internal docs, the company was founded in 2010..."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything you need for production RAG</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From data ingestion to quality evaluation, CaaS provides the complete toolkit for enterprise AI
            applications.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-accent mb-2" />
              <CardTitle>Smart Data Ingestion</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Connect Google Drive, Notion, Confluence, and 20+ other sources. Automatic chunking and embedding with
                smart deduplication.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-accent mb-2" />
              <CardTitle>Governance & Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Built-in PII detection, content filtering, and access controls. Audit trails for compliance and security
                teams.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-accent mb-2" />
              <CardTitle>Quality Evaluation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Continuous monitoring of retrieval precision, hallucination rates, and answer quality with automated
                alerts.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-muted-foreground">Start free, scale as you grow</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <div className="text-3xl font-bold">$0</div>
              <p className="text-muted-foreground">Perfect for getting started</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Up to 1,000 documents
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />3 data sources
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Basic evaluation
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-accent">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Pro</CardTitle>
                <Badge className="bg-accent text-accent-foreground">Popular</Badge>
              </div>
              <div className="text-3xl font-bold">$99</div>
              <p className="text-muted-foreground">For growing teams</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Up to 50,000 documents
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Unlimited data sources
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Advanced evaluation
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <div className="text-3xl font-bold">Custom</div>
              <p className="text-muted-foreground">For large organizations</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Unlimited everything
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  SSO & advanced security
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Dedicated support
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="text-center mt-8">
          <Link href="/pricing">
            <Button variant="outline">View detailed pricing</Button>
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to ground your AI?</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join hundreds of teams using CaaS to build reliable, context-aware AI applications.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Start Free Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline">
            Schedule Demo
          </Button>
        </div>
      </section>

      <footer className="border-t bg-muted/20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
                  <span className="font-bold text-xs text-accent-foreground">C</span>
                </div>
                <span className="font-semibold">CaaS</span>
              </div>
              <p className="text-sm text-muted-foreground">Context-as-a-Service for enterprise AI applications.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/pricing">Pricing</Link>
                </li>
                <li>
                  <Link href="/docs">Documentation</Link>
                </li>
                <li>
                  <Link href="#">API Reference</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#">About</Link>
                </li>
                <li>
                  <Link href="#">Blog</Link>
                </li>
                <li>
                  <Link href="#">Careers</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#">Help Center</Link>
                </li>
                <li>
                  <Link href="#">Contact</Link>
                </li>
                <li>
                  <Link href="#">Status</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 CaaS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
