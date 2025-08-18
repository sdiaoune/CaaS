import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined

export async function createSupabaseServerClient(): Promise<SupabaseClient> {
	const cookieStore = await cookies()
	return createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			get(name: string) {
				return cookieStore.get(name)?.value
			},
			set(name: string, value: string, options: CookieOptions) {
				cookieStore.set({ name, value, ...options })
			},
			remove(name: string, options: CookieOptions) {
				cookieStore.set({ name, value: '', ...options })
			}
		}
	})
}

export function createSupabaseServiceClient(): SupabaseClient {
	if (!supabaseServiceRoleKey) {
		throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
	}
	return createServerClient(supabaseUrl, supabaseServiceRoleKey, {
		cookies: {
			get() { return undefined },
			set() {},
			remove() {}
		}
	})
}
