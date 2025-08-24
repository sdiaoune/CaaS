import { config } from 'dotenv'
config({ path: '.env.local' })
config()
import { createClient } from '@supabase/supabase-js'

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
  if (!url || !service) throw new Error('Missing Supabase envs')
  const supabase = createClient(url, service)
  const { data: org } = await supabase.from('orgs').insert({ name: 'RLS Test Org' }).select('id').single()
  if (!org) throw new Error('Failed to create org')
  const { data: project } = await supabase.from('projects').insert({ org_id: org.id, name: 'RLS Test Project' }).select('id').single()
  if (!project) throw new Error('Failed to create project')
  console.log('RLS test bootstrap complete. Project:', project.id)
}

main().catch((e) => { console.error(e); process.exit(1) })


