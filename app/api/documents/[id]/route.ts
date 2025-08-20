import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const id = params.id
  const { data, error } = await supabase
    .from('documents')
    .select('id,title,raw_text,pii_flags')
    .eq('id', id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ document: { id: data.id, title: data.title, raw_text: data.raw_text, pii_flags: data.pii_flags || [] } })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const id = params.id
  const { data: existing } = await supabase.from('documents').select('project_id').eq('id', id).single()
  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  try {
    const { createSupabaseServiceClient } = await import('@/lib/supabase/server')
    const service = createSupabaseServiceClient()
    const { data: { user } } = await supabase.auth.getUser()
    await service.from('audit_logs').insert({ project_id: existing?.project_id, actor: user?.id, event_type: 'document.delete', target: id, diff: {} })
  } catch {}
  return NextResponse.json({ ok: true })
}


