import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest
} from 'next/server'
// import { kasadaHandler } from './lib/kasada/kasada-server'
import { Redis } from '@upstash/redis'

const MAX_REQUESTS = 50

const redis = Redis.fromEnv()

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  if (req.method === 'POST') {
    const realIp = req.headers.get('x-real-ip') || 'no-ip'
    const key = `rate-limit:${realIp}`

    try {
      // Perform atomic increment using HINCR
      const result = await redis.incr(key)

      // Set expiration only if the key is newly created
      if (result === 1) {
        await redis.expire(key, 60 * 60 * 24) // Expire in 24 hours
      }

      if (process.env.NODE_ENV === 'development') {
        return undefined
      }

      if (result > MAX_REQUESTS) {
        return new Response('Too many requests', { status: 429 })
      }
    } catch (error) {
      console.error('Error during rate limiting:', error)
      // Consider returning a generic error response here if desired
      return new Response('Internal Server Error', { status: 500 })
    }
  }

  // Call the downstream handler (kasadaHandler)
  // return kasadaHandler(req, ev)

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/chat/:id*', '/share/:id*']
}
