import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const url = new URL(req.url)
  const limit = parseInt(url.searchParams.get('limit') || '20', 10)
  const id = params.id
  const { data, error } = await supabase
    .from('chunks')
    .select('id,content')
    .eq('document_id', id)
    .order('chunk_index', { ascending: true })
    .limit(limit)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ chunks: (data || []).map(c => ({ id: c.id, text: c.content })) })
}


