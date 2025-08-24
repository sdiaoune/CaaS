import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient()
  const url = new URL(req.url)
  const projectId = url.searchParams.get('projectId')
  const days = parseInt(url.searchParams.get('days') || '30', 10)
  if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const { data, error } = await supabase
    .from('documents')
    .select('created_at')
    .eq('project_id', projectId)
    .gte('created_at', since.toISOString())
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  const counts = new Map<string, number>()
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0,10)
    counts.set(key, 0)
  }
  for (const row of data || []) {
    const key = new Date(row.created_at as string).toISOString().slice(0,10)
    if (counts.has(key)) counts.set(key, (counts.get(key) || 0) + 1)
  }
  return NextResponse.json({ series: Array.from(counts.entries()).map(([date,count])=>({ date, count })) })
}


