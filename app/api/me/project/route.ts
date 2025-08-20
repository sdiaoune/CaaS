import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'

export async function GET() {
	const supabase = createSupabaseServerClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	const { data, error } = await supabase.from('projects').select('id,name').limit(1)
	if (error) return NextResponse.json({ error: error.message }, { status: 400 })
	if (data && data.length > 0) return NextResponse.json({ project: data[0] })

	// Bootstrap a default org/project if none are visible for this user
	try {
		const service = createSupabaseServiceClient()
		// Create org and membership
		const orgName = user.email?.split('@')[0] || 'My Org'
		const { data: org } = await service.from('orgs').insert({ name: orgName }).select('id').single()
		if (org?.id) {
			await service.from('members').insert({ user_id: user.id, org_id: org.id, role: 'owner' })
			const { data: project } = await service.from('projects').insert({ org_id: org.id, name: 'Default Project' }).select('id,name').single()
			if (project?.id) {
				await service.from('policies').insert({ project_id: project.id })
				await service.from('audit_logs').insert({ project_id: project.id, actor: user.id, event_type: 'bootstrap', target: 'project', diff: { project_id: project.id } })
				return NextResponse.json({ project })
			}
		}
	} catch {}

	return NextResponse.json({ project: null })
}
