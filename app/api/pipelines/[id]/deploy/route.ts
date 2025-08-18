import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
	const supabase = await createSupabaseServerClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	const id = params.id
	const { data: pipeline, error: fetchError } = await supabase.from('pipelines').select('id,project_id,name,config,guardrails,index_name,reranker').eq('id', id).single()
	if (fetchError || !pipeline) return NextResponse.json({ error: fetchError?.message || 'Not found' }, { status: 404 })
	const hash = crypto.createHash('sha256').update(JSON.stringify({ ...pipeline, time: Date.now() })).digest('hex').slice(0, 16)
	const { data, error } = await supabase.from('pipelines').update({ last_deploy_hash: hash }).eq('id', id).select('*').single()
	if (error) return NextResponse.json({ error: error.message }, { status: 400 })
	try {
		const service = createSupabaseServiceClient()
		await service.from('audit_logs').insert({ project_id: pipeline.project_id, actor: user.id, event_type: 'pipeline.deploy', target: id, diff: { last_deploy_hash: hash } })
	} catch {}
	return NextResponse.json({ pipeline: data })
}

