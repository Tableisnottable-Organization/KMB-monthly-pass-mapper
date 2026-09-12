import Link from 'next/link';

export default function EnglishHome() {
  return (
    <main className="min-h-screen bg-[#eef7ed] text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <header className="rounded-[28px] bg-[#176b2c] p-6 text-white shadow-soft">
          <p className="text-xs uppercase tracking-[0.25em] text-green-100">
            Monthly Pass Mapper
          </p>
          <h1 className="mt-2 text-3xl font-bold">Hong Kong journey planner</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-green-50">
            Compare KMB, MTR, Citybus and walking options with monthly pass
            savings, service updates and traffic event notices.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#176b2c]" href="/">
              Chinese (Hong Kong)
            </Link>
            <Link className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white" href="/updates">
              Route updates
            </Link>
            <Link className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white" href="/traffic">
              Traffic events
            </Link>
          </div>
        </header>

        <section className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            ['Search routes', 'Plan journeys with scheduled service information and fare comparisons.'],
            ['Use GPS', 'Find your nearest mapped stop in the browser without uploading your location.'],
            ['Check alerts', 'See route changes and traffic events that may affect your journey.'],
          ].map(([title, description]) => (
            <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200" key={title}>
              <h2 className="font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            </article>
          ))}
        </section>

        <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Live ETA is not connected yet. Current route results use scheduled
          headways and will not be presented as real-time arrivals until an
          official provider feed is configured and validated.
        </p>
      </div>
    </main>
  );
}
