import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
    process.env.NEXT_PUBLIC_BASE_URL,
    'https://*.vercel.app'
].filter(Boolean) as string[]

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
const ALLOWED_HEADERS = ['Content-Type', 'Authorization']

export async function withCors(
    request: NextRequest,
    response?: NextResponse
): Promise<NextResponse> {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        const origin = request.headers.get('origin')
        const isAllowedOrigin = origin && ALLOWED_ORIGINS.some(o =>
            origin.match(new RegExp(o.replace('*', '.*')))
        )

        return new NextResponse(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': isAllowedOrigin ? origin : ALLOWED_ORIGINS[0],
                'Access-Control-Allow-Methods': ALLOWED_METHODS.join(','),
                'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(','),
                'Access-Control-Max-Age': '86400', // 24 hours
                'Vary': 'Origin'
            }
        })
    }

    // For regular requests, add CORS headers to the existing response
    const res = response || NextResponse.next()
    const origin = request.headers.get('origin')
    const isAllowedOrigin = origin && ALLOWED_ORIGINS.some(o =>
        origin.match(new RegExp(o.replace('*', '.*')))
    )

    if (isAllowedOrigin) {
        res.headers.set('Access-Control-Allow-Origin', origin)
        res.headers.set('Vary', 'Origin')
    }

    return res
}