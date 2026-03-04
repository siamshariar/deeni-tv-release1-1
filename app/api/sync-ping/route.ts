import { NextResponse } from 'next/server'
import { appendFileSync } from 'fs'

/**
 * /api/sync-ping — called at the start of every syncWithServer() invocation.
 * Used purely for server-side verification that the 5-minute sync is firing.
 * Logs a timestamped entry to /tmp/deeni-sync-calls.log.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { channelId, source } = body

    const ts = new Date().toISOString()
    const line = `[${ts}] 🔄 5-min sync fired — channel=${channelId || 'unknown'} source=${source || 'unknown'}\n`

    console.log(line.trim())

    try {
      appendFileSync('/tmp/deeni-sync-calls.log', line)
    } catch {}

    return NextResponse.json({ ok: true, timestamp: ts })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
