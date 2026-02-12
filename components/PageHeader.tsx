import Link from "next/link";

type PageHeaderProps = {
  title: string;
  description: string;
  icon?: string;
};

/** Modül sayfalarında kullanılan başlık bileşeni — AI destekli ifadeler için uyumlu */
export default function PageHeader({ title, description, icon = "📄" }: PageHeaderProps) {
  return (
    <div className="mb-10">
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,.06)] transition hover:border-brand-200 hover:text-brand-700"
      >
        <span aria-hidden>←</span> Ana sayfa
      </Link>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        <span className="sr-only">{icon}</span>
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-soft">
            <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-base leading-relaxed text-slate-600 sm:text-lg">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
