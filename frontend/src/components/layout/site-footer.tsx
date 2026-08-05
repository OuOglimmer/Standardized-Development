import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/70 bg-card/25">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-7 text-sm text-muted-foreground sm:flex-row sm:px-6">
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
