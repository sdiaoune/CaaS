import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
	const supabase = await createSupabaseServerClient()
	const { data: { session } } = await supabase.auth.getSession()
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}
	const payload = await req.json()
	const { data, error } = await supabase.functions.invoke('run-eval', { body: payload })
	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 })
	}
	try {
		const service = createSupabaseServiceClient()
		await service.from('audit_logs').insert({ project_id: payload.projectId, actor: session.user.id, event_type: 'eval.run', target: payload.evalSetId, diff: { model: payload.model } })
	} catch {}
	return NextResponse.json(data)
}

