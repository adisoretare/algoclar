import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24 text-center">
      <h1 className="font-heading text-5xl font-extrabold tracking-tight text-foreground">
        Înțelegi algoritmica,{' '}
        <span className="text-primary">nu o memorezi.</span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
        Lecții scurte, vizualizări interactive și arhivă explicată OJI/ONI
        pentru elevi din clasele V–XII.
      </p>
      <div className="mt-10 flex justify-center gap-4">
        <Link
          href="/invata"
          className="rounded-[10px] bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Începe să înveți
        </Link>
        <Link
          href="/arhiva"
          className="rounded-[10px] border border-border px-6 py-3 font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Arhivă OJI/ONI
        </Link>
      </div>
    </div>
  )
}
