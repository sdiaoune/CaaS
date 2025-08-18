import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
	const res = NextResponse.next({ request: { headers: req.headers } })
	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get: (name: string) => req.cookies.get(name)?.value,
				set: (name, value, options) => {
					res.cookies.set({ name, value, ...options })
				},
				remove: (name, options) => {
					res.cookies.set({ name, value: '', ...options })
				}
			}
		}
	)

	const { data: { session } } = await supabase.auth.getSession()

	const path = req.nextUrl.pathname
	const isPublic = (
		path.startsWith('/signin') ||
		path.startsWith('/signup') ||
		path === '/' ||
		path.startsWith('/pricing') ||
		path.startsWith('/docs') ||
		path.startsWith('/api') ||
		path === '/app/auth/callback'
	)

	const isProtectedApp = path.startsWith('/app') && !isPublic

	if (isProtectedApp && !session) {
		const redirectUrl = req.nextUrl.clone()
		redirectUrl.pathname = '/signin'
		redirectUrl.searchParams.set('redirect_to', req.nextUrl.pathname)
		return NextResponse.redirect(redirectUrl)
	}

	return res
}

export const config = {
	matcher: [
		'/app/:path*',
		'/signin',
		'/signup',
	]
}

