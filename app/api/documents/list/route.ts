import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
	const supabase = await createSupabaseServerClient()
	const url = new URL(req.url)
	const projectId = url.searchParams.get('projectId')
	const search = url.searchParams.get('search') || ''
	const status = url.searchParams.get('status') || 'all'
	const page = parseInt(url.searchParams.get('page') || '1', 10)
	const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10)
	if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
	const from = (page - 1) * pageSize
	const to = from + pageSize - 1
	let query = supabase
		.from('documents')
		.select('id,title,source_id,tokens,pii_flags,status,created_at', { count: 'exact' })
		.eq('project_id', projectId)
		.order('created_at', { ascending: false })
		.range(from, to)
	if (search) query = query.ilike('title', `%${search}%`)
	if (status !== 'all') query = query.eq('status', status)
	const { data, error, count } = await query
	if (error) return NextResponse.json({ error: error.message }, { status: 400 })

	// Map to UI shape and attach source names
	let sourceMap = new Map<string, string>()
	const sourceIds = Array.from(new Set((data || []).map(r => r.source_id).filter(Boolean))) as string[]
	if (sourceIds.length) {
		const { data: sources } = await supabase.from('sources').select('id,name').in('id', sourceIds)
		sourceMap = new Map((sources || []).map(s => [s.id, s.name]))
	}

	const items = (data || []).map(r => ({
		id: r.id,
		title: r.title || 'Untitled',
		source: r.source_id ? (sourceMap.get(r.source_id) || 'Unknown') : 'Manual',
		tokens: r.tokens || 0,
		chunks: 0,
		piiFlags: (r.pii_flags as string[]) || [],
		status: (r.status as any) || 'indexed',
		ingressDate: new Date(r.created_at as string),
	}))

	return NextResponse.json({ items, total: count ?? 0 })
}
