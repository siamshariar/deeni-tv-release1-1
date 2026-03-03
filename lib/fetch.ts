/**
 * SERVER-SIDE fetch with JWT token generation for external API requests.
 * Uses Node.js jwt-simple (requires require('crypto')).
 *
 * For client-side (browser) fetch, see lib/client-fetch.ts which uses
 * the Web Crypto API and works without Node.js polyfills.
 */
import jwt from 'jwt-simple'
import moment from 'moment-timezone'

function generateToken(): string {
  const secret = process.env.NP_AS_L
  if (!secret) {
    throw new Error('NP_AS_L environment variable is not set')
  }

  const timestamp = moment().tz('America/New_York').valueOf()

  const payload = {
    userAgent: 'DeeniTV-Server/1.0',
    timestamp,
    random: Math.floor(Math.random() * 1000000000),
  }

  return jwt.encode(payload, secret)
}

/**
 * Server-side fetch with JWT auth (for use in API routes only).
 */
export async function fetchWithAuth(url: string): Promise<any> {
  const token = generateToken()

  const res = await fetch(url, {
    headers: {
      'p': token,
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'Cache-Control': 'no-cache',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error ${res.status}: ${text.substring(0, 300)}`)
  }

  return res.json()
}

