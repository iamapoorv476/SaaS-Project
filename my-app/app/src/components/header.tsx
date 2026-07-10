import Link from "next/link"

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#1C1A15]/10 bg-[#F7F5EF]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-[#1C1A15]">
            <span className="[font-family:var(--font-display),ui-serif,Georgia,serif] text-sm font-semibold text-[#F2DF4E]">
              P
            </span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-[#1C1A15]">
            ProjectFlow
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {[
            { label: "Features", href: "#features" },
            { label: "Demo", href: "#demo" },
            { label: "Stack", href: "#stack" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-mono text-xs uppercase tracking-[0.14em] text-[#6F6A5C] transition-colors hover:text-[#1C1A15]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/signin"
            className="text-sm text-[#6F6A5C] transition-colors hover:text-[#1C1A15]"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-[3px] bg-[#1C1A15] px-4 py-2 text-sm font-semibold text-[#F7F5EF] transition-colors hover:bg-black"
          >
            Try free
          </Link>
        </div>
      </div>
    </header>
  )
}
