import Link from "next/link"

export function Header(){
    return(
        <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur">
           <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                        <span className="text-sm font-bold text-white">P</span>

                    </div>
                    <span className="text-lg font-semibold text-white">ProjectFlow</span>
                </div>
                <nav className="hidden gap-8 md:flex">
                    <a href="#features" className="text-sm text-slate-300 hover: text-white transition-colors">
                        Features
                    </a>
                    <a href="#pricing" className="text-sm text-slate-300 hover:text-white transition-colors">
                        Pricing
                    </a>
                    <a href="#" className="text-sm text-slate-300 hover:text-white transition-colors">
                        Docs
                     </a>
                </nav>
                <Link
                    href = "/signin"

               className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white
                                    hover:bg-blue-700 transition-colors">
                                        
                
                    Sign In
                   
                </Link>

            </div>
           </div>

        </header>
    )
}