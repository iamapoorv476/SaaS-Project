export function Features(){
   const features = [
    {
      icon: "👥",
      title: "Invite members, assign roles, control access",
      description: "Real-time collaboration tools that keep your team in sync and productive.",
    },
    {
      icon: "📁",
      title: "Project Management",
      description: "Organize projects with intuitive task management and workflow automation.",
    },
    {
      icon: "📊",
      title: "Track team velocity and delivery bottlenecks",
      description: "Gain insights with comprehensive analytics and performance tracking.",
    },
  ]

  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-16 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Powerful Features</h2>
        <p className="text-lg text-slate-300">Everything you need to manage projects efficiently</p>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="rounded-lg border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 hover:border-blue-500/50 transition-all"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-slate-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}