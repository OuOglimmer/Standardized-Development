import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
        <p>
          © {year} OuOglimmer. All rights reserved.
        </p>
        <nav className="flex items-center gap-3">
          <Link
            href="https://github.com/OuOglimmer"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </Link>
          <span className="text-border" aria-hidden>
            ·
          </span>
          <Link
            href="/rss.xml"
            className="transition-colors hover:text-foreground"
          >
            RSS
          </Link>
        </nav>
      </div>
    </footer>
  );
}
