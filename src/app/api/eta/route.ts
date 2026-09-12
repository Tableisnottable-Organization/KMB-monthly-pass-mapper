import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MAX_UPSTREAM_URL_LENGTH = 512;
const UPSTREAM_TIMEOUT_MS = 5000;
const ALLOWED_UPSTREAM_HOSTS = new Set([
  'data.gov.hk',
  'api.data.gov.hk',
  'data.etag.hk',
  'rt.data.gov.hk',
]);

interface RateLimiterBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

declare global {
  interface CloudflareEnv {
    RATE_LIMITER?: RateLimiterBinding;
  }
}

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}

function getSafeUpstreamUrl(request: NextRequest): URL | null {
  const rawUrl = request.nextUrl.searchParams.get('url');
  if (!rawUrl || rawUrl.length > MAX_UPSTREAM_URL_LENGTH) {
    return null;
  }

  try {
    const upstreamUrl = new URL(rawUrl);
    if (
      upstreamUrl.protocol !== 'https:' ||
      !ALLOWED_UPSTREAM_HOSTS.has(upstreamUrl.hostname)
    ) {
      return null;
    }
    return upstreamUrl;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const upstreamUrl = getSafeUpstreamUrl(request);
  if (!upstreamUrl) {
    return errorResponse(
      'Provide a valid HTTPS DATA.GOV.HK or approved transit API URL.',
      400,
    );
  }

  const ipAddress =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';
  const { env } = await getCloudflareContext({ async: true });
  if (env.RATE_LIMITER) {
    const rateLimitResult = await env.RATE_LIMITER.limit({
      key: `eta:${ipAddress}`,
    });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many ETA requests. Please try again shortly.' },
        {
          status: 429,
          headers: {
            'Cache-Control': 'no-store',
            'Retry-After': '60',
          },
        },
      );
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const response = await fetch(upstreamUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'KMB-Monthly-Pass-Mapper/1.0',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return errorResponse(
        `ETA provider returned HTTP ${response.status}.`,
        502,
      );
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('json')) {
      return errorResponse('ETA provider returned an unsupported format.', 502);
    }

    return new NextResponse(await response.text(), {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    const message =
      error instanceof DOMException && error.name === 'AbortError'
        ? 'ETA provider timed out.'
        : 'Unable to reach the ETA provider.';
    return errorResponse(message, 504);
  } finally {
    clearTimeout(timeout);
  }
}
