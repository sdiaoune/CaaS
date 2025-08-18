import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
	const supabase = await createSupabaseServerClient()
	const url = new URL(req.url)
	const projectId = url.searchParams.get('projectId')
	const sourceId = url.searchParams.get('sourceId')
	if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
	const query = supabase.from('sources').select('*').eq('project_id', projectId)
	if (sourceId) query.eq('id', sourceId)
	const { data, error } = await query
	if (error) return NextResponse.json({ error: error.message }, { status: 400 })
	return NextResponse.json({ sources: data })
}

