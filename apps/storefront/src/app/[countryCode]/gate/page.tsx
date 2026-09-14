import { acknowledgeGate } from "./actions"

export const metadata = {
  title: "Confirm Research-Use-Only Access — RegenX Labs",
}

export default async function GatePage({
  params,
  searchParams,
}: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ redirect?: string; error?: string }>
}) {
  const { countryCode } = await params
  const { redirect: redirectTarget, error } = await searchParams

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md border border-regenx-navy/10 p-8">
        <p className="text-[11px] uppercase tracking-[0.25em] text-regenx-crimson font-semibold mb-2">
          Before you continue
        </p>
        <h1 className="font-display text-2xl text-regenx-navy mb-2">
          Confirm Research-Use-Only Access
        </h1>
        <p className="text-sm text-regenx-muted mb-6">
          Review and accept both statements to enter the RegenX Labs
          catalog.
        </p>

        {error === "missing" && (
          <p className="text-sm text-regenx-crimson mb-4" role="alert">
            Please complete all fields before continuing.
          </p>
        )}

        <form action={acknowledgeGate} className="flex flex-col gap-4">
          <input type="hidden" name="country_code" value={countryCode} />
          <input
            type="hidden"
            name="redirect"
            value={redirectTarget || `/${countryCode}`}
          />

          <label className="flex flex-col gap-1 text-sm text-regenx-navy">
            <span className="font-semibold">Researcher type</span>
            <select
              name="researcher_type"
              required
              defaultValue=""
              className="border border-regenx-navy/20 px-3 py-2 text-sm"
            >
              <option value="" disabled>
                Select one
              </option>
              <option value="private-research">Private Research</option>
              <option value="laboratory">Laboratory</option>
              <option value="academic">Academic</option>
            </select>
          </label>

          <label className="flex items-start gap-2 text-sm text-regenx-navy">
            <input
              type="checkbox"
              name="age_confirmed"
              required
              className="mt-1"
            />
            <span>I certify that I am 22 years of age or older.</span>
          </label>

          <label className="flex items-start gap-2 text-sm text-regenx-navy">
            <input
              type="checkbox"
              name="ruo_confirmed"
              required
              className="mt-1"
            />
            <span>
              I certify that I am accessing these products for laboratory
              research use only. I understand they are not intended for
              human consumption, veterinary use, diagnostic use,
              therapeutic use, injection, resale as a drug, or any personal
              use.
            </span>
          </label>

          <p className="text-xs text-regenx-muted">
            RegenX Labs does not provide medical advice, dosing guidance,
            protocols, cycle recommendations, or treatment recommendations.
          </p>

          <button
            type="submit"
            className="mt-2 bg-regenx-navy hover:bg-regenx-navy-light transition-colors text-white text-xs uppercase tracking-widest font-semibold px-8 py-4 min-h-[44px]"
          >
            Continue to RegenX Labs
          </button>

          <a
            href="https://www.google.com/"
            className="text-center text-xs text-regenx-muted underline"
          >
            I do not agree — leave site
          </a>
        </form>

        <p className="text-xs text-regenx-muted mt-6">
          Your acknowledgment is stored only to maintain access during your
          visit.
        </p>
      </div>
    </main>
  )
}
