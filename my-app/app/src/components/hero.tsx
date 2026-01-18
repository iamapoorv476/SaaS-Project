export function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight text-balance">
          Turn Project Chaos Into Clarity
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-slate-300 mb-10 text-balance">
          Streamline your project management workflow and collaborate seamlessly with your team. Ship products faster
          than ever before.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto rounded-full bg-blue-600 px-8 py-3 text-base font-semibold text-white hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-500/20">
            Get Started Free
          </button>
          <button className="w-full sm:w-auto rounded-full border border-slate-600 bg-transparent px-8 py-3 text-base font-semibold text-white hover:border-slate-400 hover:bg-slate-800/50 transition-all">
            Watch Demo
          </button>
        </div>
      </div>
      
    </section>
  )
}
