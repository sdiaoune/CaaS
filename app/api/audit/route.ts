import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
	const supabase = await createSupabaseServerClient()
	const url = new URL(req.url)
	const projectId = url.searchParams.get('projectId')
	const page = parseInt(url.searchParams.get('page') || '1', 10)
	const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10)
	if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
	const from = (page - 1) * pageSize
	const to = from + pageSize - 1
	const { data, error, count } = await supabase
		.from('audit_logs')
		.select('*', { count: 'exact' })
		.eq('project_id', projectId)
		.order('created_at', { ascending: false })
		.range(from, to)
	if (error) return NextResponse.json({ error: error.message }, { status: 400 })
	return NextResponse.json({ logs: data, total: count })
}

