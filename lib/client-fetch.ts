/**
 * CLIENT-SIDE fetch with JWT token generation.
 * Runs in the BROWSER — uses Web Crypto API (no Node.js polyfills needed).
 *
 * Follows the same pattern as Quran Tube's ct() + getVideosDataByUrl():
 *   - JWT payload: { userAgent, timestamp, random }
 *   - Algorithm: HS256
 *   - Token sent in the 'p' header
 *   - Secret from NEXT_PUBLIC_NP_AS_L env var
 *
 * Cloudflare allows these requests because they come from a real browser.
 */

// ── Base64url helpers (no padding, URL-safe) ──

function base64urlEncode(data: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function utf8ToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

// ── JWT HS256 encode using Web Crypto API ──

async function jwtEncode(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }

  const headerB64 = base64urlEncode(utf8ToUint8Array(JSON.stringify(header)))
  const payloadB64 = base64urlEncode(utf8ToUint8Array(JSON.stringify(payload)))

  const signingInput = `${headerB64}.${payloadB64}`

  // Import the secret as an HMAC key
  const keyData = utf8ToUint8Array(secret)
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData.buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  // Sign
  const signingInputBytes = utf8ToUint8Array(signingInput)
  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, signingInputBytes.buffer as ArrayBuffer)
  const signatureB64 = base64urlEncode(new Uint8Array(signatureBuffer))

  return `${signingInput}.${signatureB64}`
}

// ── Token generator (mirrors Quran Tube ct()) ──

async function generateClientToken(): Promise<string> {
  const secret = process.env.NEXT_PUBLIC_NP_AS_L
  if (!secret) {
    throw new Error('NEXT_PUBLIC_NP_AS_L environment variable is not set')
  }

  // Get current time in America/New_York timezone (same as Quran Tube)
  // Use Intl to avoid pulling in moment-timezone on the client
  const now = Date.now()

  const payload = {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'DeeniTV/1.0',
    timestamp: now,
    random: Math.floor(Math.random() * 1000000000),
  }

  return jwtEncode(payload, secret)
}

// ── Public fetch function ──

/**
 * Client-side fetch with JWT auth (runs in browser, bypasses Cloudflare).
 * Mirrors Quran Tube's getVideosDataByUrl().
 */
export async function clientFetchWithAuth(url: string): Promise<any> {
  const token = await generateClientToken()

  const res = await fetch(url, {
    headers: {
      'p': token,
    },
  })

  return res.json()
}
