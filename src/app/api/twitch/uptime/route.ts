import { NextResponse } from 'next/server';

const CHANNEL = process.env.NEXT_PUBLIC_CHANNEL ?? "quin69";

export async function GET() {
  try {
    const response = await fetch(`https://decapi.me/twitch/uptime/${CHANNEL.toLowerCase()}`, {
      next: { revalidate: 30 } // Cache for 30 seconds to avoid API spamming
    });
    const text = await response.text();
    return new NextResponse(text, { status: 200 });
  } catch {
    return new NextResponse('offline', { status: 200 });
  }
}
