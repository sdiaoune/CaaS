import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
	const supabase = createSupabaseServerClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	const { data, error } = await supabase.from('projects').select('id,name').limit(1)
	if (error) return NextResponse.json({ error: error.message }, { status: 400 })
	if (!data || data.length === 0) return NextResponse.json({ project: null })
	return NextResponse.json({ project: data[0] })
}
