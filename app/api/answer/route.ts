import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
	const supabase = await createSupabaseServerClient()
	const { data: { session } } = await supabase.auth.getSession()
	if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	const t0 = Date.now()
	const { projectId, query, k = 6 } = await req.json()
	if (!projectId || !query) return NextResponse.json({ error: 'Missing projectId or query' }, { status: 400 })
	const { data: searchData, error: searchError } = await supabase.functions.invoke('search', { body: { projectId, query, k } })
	if (searchError) return NextResponse.json({ error: searchError.message }, { status: 500 })
	const hits = (searchData?.hits || []) as Array<any>
	const chunks = hits.map((h: any, i: number) => ({
		id: h.chunk_id ?? i,
		text: h.content,
		source: h.document?.title || `Doc ${i + 1}`,
		score: h.score ?? 0,
		tokens: Math.round(((h.content || '').length) / 4)
	}))
	// Simple synthesis fallback; replace with LLM call if OPENAI_API_KEY is configured
	const contextSummary = chunks.slice(0, 3).map((c, i) => `${i + 1}. ${c.text?.slice(0, 200)}`).join('\n')
	const answer = chunks.length
		? `Answer synthesized for: "${query}"\n\nKey points from context:\n${contextSummary}${chunks.length > 3 ? '\n…' : ''}`
		: 'No relevant context found.'
	const latency = Date.now() - t0
	const tokens = chunks.reduce((acc, c) => acc + (c.tokens || 0), 0)
	const cost = 0
	const trace = {
		retrieval: { duration: latency, count: chunks.length },
		reranking: { duration: 0, scores: chunks.map(c => c.score) },
		guardrails: { duration: 0, decisions: [] as string[] },
		generation: { duration: 0, tokens: 0 },
	}

	// Optional audit (service role)
	try {
		const service = createSupabaseServiceClient()
		await service.from('audit_logs').insert({ project_id: projectId, actor: session.user.id, event_type: 'playground.answer', target: 'answer', diff: { query, k, chunks: chunks.length } })
	} catch {}

	return NextResponse.json({ answer, chunks, latency, tokens, cost, trace })
}

