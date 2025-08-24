import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
	const supabase = await createSupabaseServerClient()
	const { data: { session } } = await supabase.auth.getSession()
	if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	const { projectId, fileName } = await req.json()
	if (!projectId || !fileName) return NextResponse.json({ error: 'Missing projectId or fileName' }, { status: 400 })
	const path = `${projectId}/${Date.now()}_${Math.random().toString(36).slice(2)}_${fileName}`
	// Signed upload URL
	// @ts-ignore newer storage API may not have typings in older versions
	const { data, error } = await supabase.storage.from('documents').createSignedUploadUrl(path)
	if (error) return NextResponse.json({ error: error.message }, { status: 400 })
	return NextResponse.json({ path, signedUrl: data?.signedUrl || data?.url, token: (data as any)?.token })
}

