import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get('term');
    const media = searchParams.get('media') || 'music';
    const entity = searchParams.get('entity') || 'song';
    const limit = searchParams.get('limit') || '1';

    if (!term) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const itunesUrl = `https://itunes.apple.com/search?${new URLSearchParams({
      term,
      media,
      entity,
      limit,
    }).toString()}`;

    const response = await fetch(itunesUrl, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!response.ok) {
      return NextResponse.json({ results: [], error: 'Failed to fetch from iTunes' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error in iTunes search API proxy:', error);
    return NextResponse.json({ results: [], error: 'Internal server error' }, { status: 500 });
  }
}
