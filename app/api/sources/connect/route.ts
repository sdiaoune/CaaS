import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
	const supabase = await createSupabaseServerClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	const { projectId, sourceId, type, name, config } = await req.json()
	if (!projectId || !type || !name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
	let data, error
	if (sourceId) {
		const update = await supabase.from('sources').update({ status: 'connected', config: config ?? {} }).eq('id', sourceId).select('*').single()
		data = update.data as any
		error = update.error as any
	} else {
		const insert = await supabase
			.from('sources')
			.insert({ project_id: projectId, type, name, status: 'connected', config: config ?? {} })
			.select('*')
			.single()
		data = insert.data as any
		error = insert.error as any
	}
	if (error) return NextResponse.json({ error: error.message }, { status: 400 })
	try {
		const service = createSupabaseServiceClient()
		await service.from('audit_logs').insert({ project_id: data.project_id, actor: user.id, event_type: 'source.connect', target: data.id, diff: { type, name } })
	} catch {}
	return NextResponse.json({ source: data })
}

