import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient()
  const url = new URL(req.url)
  const projectId = url.searchParams.get('projectId')
  const n = parseInt(url.searchParams.get('n') || '100', 10)
  if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
  const { data, error } = await supabase
    .from('eval_runs')
    .select('duration_ms')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(n)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  const durations = (data || []).map(r => r.duration_ms || 0).sort((a,b)=> a-b)
  const p95 = durations.length ? durations[Math.floor(0.95 * (durations.length - 1))] : 0
  return NextResponse.json({ p95 })
}


