import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const id = params.id
  const { data: doc, error: fetchError } = await supabase.from('documents').select('id,project_id,raw_text,title').eq('id', id).single()
  if (fetchError || !doc) return NextResponse.json({ error: fetchError?.message || 'Not found' }, { status: 404 })
  const payload = { projectId: doc.project_id, title: doc.title || 'Reindex', text: doc.raw_text || '' }
  const { data, error } = await supabase.functions.invoke('ingest-document', { body: payload })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  try {
    const service = createSupabaseServiceClient()
    const { data: { user } } = await supabase.auth.getUser()
    await service.from('audit_logs').insert({ project_id: doc.project_id, actor: user?.id, event_type: 'document.reindex', target: id, diff: { count: data?.count ?? 1 } })
  } catch {}
  return NextResponse.json({ result: data })
}


