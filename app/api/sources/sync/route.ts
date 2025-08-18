import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
	const supabase = await createSupabaseServerClient()
	const { data: { session } } = await supabase.auth.getSession()
	if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	const { projectId, sourceId } = await req.json()
	if (!projectId || !sourceId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
	const demo = { projectId, sourceId, title: 'Welcome to CaaS', text: 'This is a demo document used to verify the ingestion pipeline. It contains sample content for testing vector search.' }
	const { data, error } = await supabase.functions.invoke('ingest-document', { body: demo })
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	await supabase.from('sources').update({ status: 'connected', last_sync_at: new Date().toISOString() }).eq('id', sourceId)
	try {
		// write audit using service role
		const { createSupabaseServiceClient } = await import('@/lib/supabase/server')
		const service = createSupabaseServiceClient()
		await service.from('audit_logs').insert({ project_id: projectId, actor: session.user.id, event_type: 'source.sync', target: sourceId, diff: { count: (data?.count ?? 1) } })
	} catch {}
	return NextResponse.json({ result: data })
}

