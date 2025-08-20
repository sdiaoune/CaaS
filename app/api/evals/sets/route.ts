import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
	const supabase = createSupabaseServerClient()
	const url = new URL(req.url)
	const projectId = url.searchParams.get('projectId')
	if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
	const { data, error } = await supabase.from('eval_sets').select('*').eq('project_id', projectId).order('updated_at', { ascending: false })
	if (error) return NextResponse.json({ error: error.message }, { status: 400 })
	return NextResponse.json({ items: data || [] })
}

export async function POST(req: Request) {
	const supabase = createSupabaseServerClient()
	const body = await req.json().catch(()=> null)
	const projectId = body?.projectId as string | undefined
	if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
	const insert = await supabase.from('eval_sets').insert({ project_id: projectId, name: body?.name, domain: body?.domain, items: body?.items ?? 0 }).select('*').single()
	if (insert.error) return NextResponse.json({ error: insert.error.message }, { status: 400 })
	return NextResponse.json({ evalSet: insert.data })
}
