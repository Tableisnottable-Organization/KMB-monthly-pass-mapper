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

The source catalog is available at `GET /api/sources`. It lists each intended
Hong Kong transport source, its official page, API host, connection status and
required attribution. `AVAILABLE` means an approved source is documented; it
does not mean every endpoint has already been normalized into route results.
`PLANNED` sources are not presented as live data.

Service updates and traffic events are available at:

- `/updates` and `GET /api/updates` for route notices, temporary stop changes and timetable updates.
- `/traffic` and `GET /api/traffic` for traffic incidents, congestion and road works.

Route cards cross-reference the alert route numbers and show an affected-route
warning when a matching notice or event exists. The current records are typed
demo records with official-source links; they must be replaced by validated
provider feeds before being described as live.

## Connected official transit feeds

The app now connects to the public KMB and Citybus JSON APIs through
`GET /api/transit`:

- `GET /api/transit?operator=KMB` - KMB route catalogue.
- `GET /api/transit?operator=CTB` - Citybus route catalogue.
- `GET /api/transit?operator=KMB&stop=<stop_id>&route=<route>` - KMB live ETA.
- `GET /api/transit?operator=CTB&stop=<stop_id>&route=<route>` - Citybus live ETA.

These endpoints return `502` when the upstream provider is unavailable and do
not silently turn an outage into fake live data. The existing demo route cards
remain a separate scored sample until origin/destination geocoding and a
provider-backed route search are implemented.

## Data sources and attribution

This project is an independent prototype. It credits the Hong Kong Transport
Department, DATA.GOV.HK, KMB, Citybus and MTR where their data or official
documentation is used. Provider names, logos, route content and API terms
remain the property of their respective owners. Review each provider's
licence and attribution requirements before production deployment.

The application deliberately uses an explicit upstream allowlist. Do not turn
the ETA proxy into an arbitrary URL fetcher, and do not claim that a source is
live until its endpoint contract, update time and error behaviour have been
tested.

## Maps and ETA status

The map panel uses Google Maps when a valid project-specific Embed URL is
configured through `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL`. Without that setting,
the app uses a local visual fallback and an `api=1` Google Maps link that works
without embedding a blocked page. Do not use a guessed `output=embed` URL:
Google Maps Embed requires a valid configuration/API key and may reject
iframe requests. Follow Google's Maps Platform terms and keep the attribution
displayed in the map panel.

Demo routes intentionally contain no fabricated live ETA. They use scheduled
headways until an official KMB/Citybus feed is configured and normalized. The
ETA proxy is available for that integration, but a proxy alone does not make
the data real-time.

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