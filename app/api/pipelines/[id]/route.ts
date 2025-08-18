import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
	const supabase = await createSupabaseServerClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	const id = params.id
	const body = await req.json()
	const { data, error } = await supabase.from('pipelines').update({ name: body.name, index_name: body.indexName, reranker: body.reranker, guardrails: body.guardrails, config: body.config }).eq('id', id).select('*').single()
	if (error) return NextResponse.json({ error: error.message }, { status: 400 })
	try {
		const service = createSupabaseServiceClient()
		await service.from('audit_logs').insert({ project_id: data.project_id, actor: user.id, event_type: 'pipeline.update', target: id, diff: body })
	} catch {}
	return NextResponse.json({ pipeline: data })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
	const supabase = await createSupabaseServerClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	const id = params.id
	const { data: existing } = await supabase.from('pipelines').select('project_id').eq('id', id).single()
	const { error } = await supabase.from('pipelines').delete().eq('id', id)
	if (error) return NextResponse.json({ error: error.message }, { status: 400 })
	try {
		const service = createSupabaseServiceClient()
		await service.from('audit_logs').insert({ project_id: existing?.project_id, actor: user.id, event_type: 'pipeline.delete', target: id, diff: {} })
	} catch {}
	return NextResponse.json({ ok: true })
}

