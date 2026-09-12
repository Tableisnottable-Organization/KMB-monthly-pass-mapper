# KMB Monthly Pass Mapper

## API

The route API is available at `GET /api/routes`. It is rate-limited at the
Cloudflare edge and returns `429` with `Retry-After` when the per-IP limit is
exceeded.

The ETA proxy is available at `GET /api/eta?url=<encoded-url>`. For security,
the proxy only accepts HTTPS URLs on these approved hosts:

- `data.gov.hk`
- `api.data.gov.hk`
- `data.etag.hk`
- `rt.data.gov.hk`

Responses are not cached because ETA data changes frequently. The proxy also
rejects invalid hosts, enforces a five-second upstream timeout, and returns
`502` or `504` for upstream failures.

## Deployment

This project deploys as a Cloudflare Worker using OpenNext, not as a static
Cloudflare Pages site. The `wrangler.jsonc` file enables `nodejs_compat` and
the Cloudflare native `RATE_LIMITER` binding.

Production settings:

```text
Production branch: main
Build command: npm run cf:build
Deploy command: npx wrangler deploy
Root directory: /
```

Cloudflare Cache Rules should bypass cache for `/api/*`. Do not add a broad
cache rule for ETA responses.

## Daily workflow

1. Make changes on a feature branch.
2. Run `npm run build` and, for deployment changes, `npm run cf:build`.
3. Push the branch and open a pull request.
4. Merge into `main` after review.
5. Cloudflare deploys the latest `main` commit automatically when Git
   integration is enabled.