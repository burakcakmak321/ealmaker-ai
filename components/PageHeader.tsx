import Link from "next/link";

type PageHeaderProps = {
  title: string;
  description: string;
  icon?: string;
};

export default function PageHeader({ title, description, icon = "📄" }: PageHeaderProps) {
  return (
    <div className="mb-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-brand-600"
      >
        ← Ana sayfa
      </Link>
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 text-2xl">
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
