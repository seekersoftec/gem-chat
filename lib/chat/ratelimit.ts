import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

const appRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  analytics: true,
  prefix: 'app_ratelimit'
})

function getIP() {
  return headers().get('x-real-ip') ?? 'unknown'
}

export async function rateLimit() {
  const limit = await appRatelimit.limit(getIP())
  if (!limit.success) {
    redirect('/waiting-room')
  }
}
