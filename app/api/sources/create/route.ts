import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const projectId = body?.projectId as string | undefined
  const type = body?.type as string | undefined
  const name = body?.name as string | undefined
  const cfg = (body?.config as Record<string, unknown>) ?? {}
  if (!projectId || !type || !name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // Use service role to ensure write succeeds in production
  const service = createSupabaseServiceClient()
  const insert = await service
    .from('sources')
    .insert({ project_id: projectId, type, name, status: 'connected', config: cfg })
    .select('*')
    .single()
  if (insert.error) return NextResponse.json({ error: insert.error.message }, { status: 400 })

  try {
    await service.from('audit_logs').insert({ project_id: projectId, actor: user.id, event_type: 'source.create', target: insert.data.id, diff: { type, name } })
  } catch {}

  return NextResponse.json({ source: insert.data })
}


