import { getCloudflareContext } from '@opennextjs/cloudflare';

export interface RateLimiterBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

declare global {
  interface CloudflareEnv {
    RATE_LIMITER?: RateLimiterBinding;
  }
}

export async function getRateLimiter(): Promise<RateLimiterBinding | undefined> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env.RATE_LIMITER;
  } catch {
    // Local Next.js and preview runtimes do not provide Cloudflare bindings.
    return undefined;
  }
}
