import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
	const supabase = await createSupabaseServerClient()
	const { data: { session }, error: sessionError } = await supabase.auth.getSession()
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}
	const payload = await req.json()
	const { data, error } = await supabase.functions.invoke('ingest-document', {
		body: payload,
	})
	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 })
	}
	return NextResponse.json(data)
}

