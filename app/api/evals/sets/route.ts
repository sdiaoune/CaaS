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
