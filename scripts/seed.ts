import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

async function main() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
	const service = process.env.SUPABASE_SERVICE_ROLE_KEY!
	if (!url || !service) throw new Error('Missing Supabase envs')
	const supabase = createClient(url, service)

	// Create org and userless seed (service role bypasses RLS insert for audit only)
	const { data: org } = await supabase.from('orgs').insert({ name: 'Demo Org' }).select('id').single()
	if (!org) throw new Error('Failed to create org')
	const { data: project } = await supabase.from('projects').insert({ org_id: org.id, name: 'Demo Project' }).select('id').single()
	if (!project) throw new Error('Failed to create project')
	await supabase.from('policies').insert({ project_id: project.id })

	// Call edge function to ingest two demo docs. Use anon key but with service Authorization.
	const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
	const authHeader = `Bearer ${service}`
	const docs = [
		{ title: 'Demo Doc A', text: 'CaaS is Context-as-a-Service. It enables RAG apps to manage knowledge.' },
		{ title: 'Demo Doc B', text: 'Vector search uses embeddings with pgvector to find similar chunks.' },
	]
	for (const d of docs) {
		await fetch(`${url}/functions/v1/ingest-document`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
			body: JSON.stringify({ projectId: project.id, title: d.title, text: d.text })
		})
	}

	console.log('Seed complete. Project ID:', project.id)
}

main().catch((e) => { console.error(e); process.exit(1) })

