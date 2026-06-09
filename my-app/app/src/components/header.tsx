import Link from "next/link"

export function Header() {
  return (
    <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-600/30">
              <span className="text-sm font-bold text-white">P</span>
            </div>
            <span className="text-base font-semibold text-white tracking-tight">ProjectFlow</span>
          </div>

          <nav className="hidden gap-8 md:flex">
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#demo" className="text-sm text-slate-400 hover:text-white transition-colors">
              Demo
            </a>
            <a href="#stack" className="text-sm text-slate-400 hover:text-white transition-colors">
              Stack
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
            >
              Try free
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}