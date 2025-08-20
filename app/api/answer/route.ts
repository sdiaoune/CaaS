import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
	const supabase = await createSupabaseServerClient()
	const { data: { session } } = await supabase.auth.getSession()
	if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	const t0 = Date.now()
	const { projectId, query, k = 6 } = await req.json()
	if (!projectId || !query) return NextResponse.json({ error: 'Missing projectId or query' }, { status: 400 })
	// Apply allowed_sources governance by passing to search function
	let allowedSources: string[] | null = null
	try {
		const { data: policies } = await supabase.from('policies').select('allowed_sources').eq('project_id', projectId).limit(1)
		allowedSources = (policies?.[0]?.allowed_sources as string[]) || null
	} catch {}
	const { data: searchData, error: searchError } = await supabase.functions.invoke('search', { body: { projectId, query, k, allowedSources } })
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
	let answer = chunks.length
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

	// Apply simple guardrails (profanity redaction) based on governance policy
	try {
		const { data: policies } = await supabase.from('policies').select('*').eq('project_id', projectId).limit(1)
		const policy = policies?.[0] as any
		if (policy?.profanity_level && typeof answer === 'string') {
			const profane = /(damn|shit|fuck)/gi
			if (policy.profanity_level !== 'high') {
				answer = answer.replace(profane, '[redacted]')
				trace.guardrails.decisions.push('profanity_redaction')
			}
		}
	} catch {}

	// Optional audit (service role)
	try {
		const service = createSupabaseServiceClient()
		await service.from('audit_logs').insert({ project_id: projectId, actor: session.user.id, event_type: 'playground.answer', target: 'answer', diff: { query, k, chunks: chunks.length } })
	} catch {}

	return NextResponse.json({ answer, chunks, latency, tokens, cost, trace })
}

