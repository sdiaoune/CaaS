import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient()
  const url = new URL(req.url)
  const projectId = url.searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
  const { data, error } = await supabase
    .from('documents')
    .select('source_id')
    .eq('project_id', projectId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  const sourceIds = Array.from(new Set((data || []).map(r => r.source_id).filter(Boolean))) as string[]
  let names = new Map<string,string>()
  if (sourceIds.length) {
    const { data: sources } = await supabase.from('sources').select('id,name').in('id', sourceIds)
    names = new Map((sources || []).map(s=> [s.id, s.name]))
  }
  const counts = new Map<string, number>()
  for (const row of data || []) {
    const label = row.source_id ? (names.get(row.source_id) || 'Unknown') : 'Manual'
    counts.set(label, (counts.get(label) || 0) + 1)
  }
  return NextResponse.json({ series: Array.from(counts.entries()).map(([name,count])=>({ name, count })) })
}


