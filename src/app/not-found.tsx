import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-edge flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="eyebrow mb-4">Error 404</p>
      <h1 className="text-display-xl font-bold tracking-tight">Lost the trail.</h1>
      <p className="mt-4 max-w-md text-ink-muted dark:text-paper/60">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="btn-primary mt-8">
        Back to home
      </Link>
    </div>
  );
}
