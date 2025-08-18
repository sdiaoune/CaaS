import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
	const url = new URL(request.url)
	const code = url.searchParams.get('code')
	const supabase = await createSupabaseServerClient()

	if (code) {
		await supabase.auth.exchangeCodeForSession(code)
	}

	try {
		const { data: { user } } = await supabase.auth.getUser()
		if (user) {
			try {
				const service = createSupabaseServiceClient()
				const { data: memberships } = await service.from('members').select('org_id').eq('user_id', user.id).limit(1)
				if (!memberships || memberships.length === 0) {
					const orgName = user.email?.split('@')[0] || 'My Org'
					const { data: org } = await service.from('orgs').insert({ name: orgName }).select('id').single()
					if (org?.id) {
						await service.from('members').insert({ user_id: user.id, org_id: org.id, role: 'owner' })
						const { data: project } = await service.from('projects').insert({ org_id: org.id, name: 'Default Project' }).select('id').single()
						if (project?.id) {
							await service.from('policies').insert({ project_id: project.id })
							await service.from('audit_logs').insert({ project_id: project.id, actor: user.id, event_type: 'bootstrap', target: 'project', diff: { project_id: project.id } })
						}
					}
				}
			} catch {}
		}
	} catch {}

	return NextResponse.redirect(new URL('/app', url.origin))
}
