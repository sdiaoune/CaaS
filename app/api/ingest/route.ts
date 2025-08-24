import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
	const supabase = await createSupabaseServerClient()
	const { data: { session }, error: sessionError } = await supabase.auth.getSession()
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}
	const payload = await req.json()
	const { data, error } = await supabase.functions.invoke('ingest-document', {
		body: payload,
	})
	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 })
	}
	try {
		const { createSupabaseServiceClient } = await import('@/lib/supabase/server')
		const service = createSupabaseServiceClient()
		await service.from('audit_logs').insert({ project_id: payload.projectId, actor: session.user.id, event_type: 'document.ingest', target: data?.document_id || 'document', diff: { title: payload.title } })
	} catch {}
	return NextResponse.json(data)
}

