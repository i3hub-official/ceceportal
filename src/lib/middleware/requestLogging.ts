import type { NextRequest } from 'next/server';

export async function withRequestLogging(request: NextRequest) {
    if (process.env.NODE_ENV === 'development') {
        // console.log(`[${request.method}] ${request.nextUrl.pathname}`, {
        //     ip: request.headers.get('x-real-ip') || '127.0.0.1',
        //     ua: request.headers.get('user-agent'),
        //     referrer: request.headers.get('referer')
        // });
        // // Log query parameters if present
        if (request.nextUrl.search) {
            // console.log('Query parameters:', request.nextUrl.searchParams.toString());
        }
        // Log request body if it's a POST or PUT request
        if (['POST', 'PUT'].includes(request.method)) {
            // const body = await request.text();
            // console.log('Request body:', body);
        }
    }
}