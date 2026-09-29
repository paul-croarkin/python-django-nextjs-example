import { NextRequest, NextResponse } from "next/server";

const CACHE_TTL_MS = 5 * 60 * 1000;
const backendUrl = process.env.DJANGO_API_URL ?? "http://127.0.0.1:8000/api";

const cache = new Map<string, { expiresAt: number; payload: unknown }>();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = (searchParams.get("q") ?? "").trim();

  if (!query) {
    return NextResponse.json({ results: [], query: "", cached: false });
  }

  const cacheKey = query.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ ...((cached.payload as Record<string, unknown>)), cached: true });
  }

  const upstreamUrl = `${backendUrl}/breweries/?q=${encodeURIComponent(query)}`;
  const response = await fetch(upstreamUrl);

  if (!response.ok) {
    return NextResponse.json({ results: [], query, cached: false, error: "Unable to fetch breweries at this time." }, { status: 502 });
  }

  const payload = await response.json();
  cache.set(cacheKey, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    payload,
  });

  return NextResponse.json({ ...payload, cached: false });
}
