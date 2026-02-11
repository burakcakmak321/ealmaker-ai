import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="mb-2 text-5xl font-bold text-slate-900">404</h1>
      <p className="mb-8 text-slate-600">Bu sayfa bulunamadı.</p>
      <Link
        href="/"
        className="rounded-xl bg-brand-600 px-8 py-4 font-semibold text-white shadow-[0_4px_14px_-2px_rgba(5,150,105,.4)] transition hover:bg-brand-700"
      >
        Ana sayfaya dön
      </Link>
    </div>
  );
}
