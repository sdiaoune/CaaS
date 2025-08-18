import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
	const supabase = await createSupabaseServerClient()
	const url = new URL(req.url)
	const projectId = url.searchParams.get('projectId')
	if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
	const { data, error } = await supabase.from('policies').select('*').eq('project_id', projectId).single()
	if (error) return NextResponse.json({ error: error.message }, { status: 400 })
	return NextResponse.json({ policy: data })
}

export async function PUT(req: Request) {
	const supabase = await createSupabaseServerClient()
	const body = await req.json()
	const { projectId, ...fields } = body
	if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
	const { data: existing } = await supabase.from('policies').select('id').eq('project_id', projectId).maybeSingle()
	let response
	if (existing?.id) {
		response = await supabase.from('policies').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', existing.id).select('*').single()
	} else {
		response = await supabase.from('policies').insert({ project_id: projectId, ...fields }).select('*').single()
	}
	if (response.error) return NextResponse.json({ error: response.error.message }, { status: 400 })
	return NextResponse.json({ policy: response.data })
}

