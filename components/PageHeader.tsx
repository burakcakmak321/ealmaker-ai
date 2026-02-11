import Link from "next/link";

type PageHeaderProps = {
  title: string;
  description: string;
  icon?: string;
};

/** Modül sayfalarında kullanılan başlık bileşeni — AI destekli ifadeler için uyumlu */
export default function PageHeader({ title, description, icon = "📄" }: PageHeaderProps) {
  return (
    <div className="mb-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-brand-600"
      >
        <span>←</span> Ana sayfa
      </Link>
      <div className="flex items-start gap-5">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100/80 text-2xl shadow-[0_1px_3px_rgba(5,150,105,.08)]">
          {icon}
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-lg leading-relaxed text-slate-600">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
