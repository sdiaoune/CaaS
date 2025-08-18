import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
	const supabase = await createSupabaseServerClient()
	const url = new URL(req.url)
	const projectId = url.searchParams.get('projectId')
	if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
	const { count, error } = await supabase.from('documents').select('*', { count: 'exact', head: true }).eq('project_id', projectId)
	if (error) return NextResponse.json({ error: error.message }, { status: 400 })
	return NextResponse.json({ count: count ?? 0 })
}
