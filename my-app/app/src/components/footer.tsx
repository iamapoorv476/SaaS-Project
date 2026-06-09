export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-sm font-bold text-white">P</span>
            </div>
            <span className="text-base font-semibold text-white">ProjectFlow</span>
            <span className="text-slate-600 text-sm ml-2">— Multi-tenant AI platform</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a
              href="https://github.com/iamapoorv476/SaaS-Project"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/apoorva-pratap-singh"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="mailto:apoorvapratapsingh6@gmail.com"
              className="hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>

          <p className="text-slate-600 text-sm">
            Built by Apoorva Pratap Singh · MIT License
          </p>
        </div>
      </div>
    </footer>
  )
}