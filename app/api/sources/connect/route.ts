import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
	const supabase = await createSupabaseServerClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	const { projectId, type, name, config } = await req.json()
	if (!projectId || !type || !name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
	const { data, error } = await supabase
		.from('sources')
		.insert({ project_id: projectId, type, name, status: 'connected', config: config ?? {} })
		.select('*')
		.single()
	if (error) return NextResponse.json({ error: error.message }, { status: 400 })
	return NextResponse.json({ source: data })
}

