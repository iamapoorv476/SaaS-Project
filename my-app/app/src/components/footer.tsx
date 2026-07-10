export function Footer() {
  return (
    <footer className="border-t border-[#1C1A15]/10 bg-[#F7F5EF]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-6 py-9 md:flex-row lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-[#1C1A15]">
            <span className="[font-family:var(--font-display),ui-serif,Georgia,serif] text-xs font-semibold text-[#F2DF4E]">
              P
            </span>
          </div>
          <span className="text-sm font-semibold text-[#1C1A15]">ProjectFlow</span>
          <span className="hidden font-mono text-xs text-[#8A8577] sm:inline">
            — multi-tenant AI platform
          </span>
        </div>

        <div className="flex items-center gap-6 font-mono text-xs text-[#6F6A5C]">
          <a
            href="https://github.com/iamapoorv476/SaaS-Project"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[#1C1A15]"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/apoorva-pratap-singh"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[#1C1A15]"
          >
            LinkedIn
          </a>
          <a
            href="mailto:apoorvapratapsingh6@gmail.com"
            className="transition-colors hover:text-[#1C1A15]"
          >
            Contact
          </a>
        </div>

        <p className="font-mono text-xs text-[#8A8577]">
          Built by Apoorva Pratap Singh · MIT License
        </p>
      </div>
    </footer>
  )
}
