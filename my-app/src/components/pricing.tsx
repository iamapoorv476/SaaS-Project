export function Pricing(){
     const tiers = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for getting started",
      features: ["Up to 5 projects", "Basic collaboration", "1GB storage", "Email support"],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "For growing teams",
      features: [
        "Unlimited projects",
        "Advanced collaboration",
        "100GB storage",
        "Priority support",
        "Analytics dashboard",
        "API access",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations",
      features: [
        "Everything in Pro",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantee",
        "Advanced security",
        "SSO",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ]

    return (
       <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
           <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Simple, Transparent Pricing</h2> 
           <p className="text-lg text-slate-300">Choose the plan that works for you</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3 lg:gap-6">
            {tiers.map((tier,index)=>(
                <div 
                   key={index}
                   className={`rounded-lg border p-8
                    transition-all ${
                        tier.highlighted
                          ? "relative border-blue-500 bg-gradient-to-br from-blue-950 to-slate-950 ring-2 ring-blue-500/20 md:scale-105"
                          : "border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 hover:border-slate-700"
                    }`}
                >
                  {tier.highlighted && (
                     <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 px-4 py-1 rounded-full text-sm font-semibold text-white">
                         Most Popular
                     </div>
                  )}
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-slate-400 text-sm mb-6">{tier.description}</p>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-white">{tier.price}</span>
                    {tier.period && <span className="text-slate-400">{tier.period}</span>}
                  </div>
                  <button
                    className={`w-full rounded-lg py-3 font-semibold transition-all mb-8 ${
                      tier.highlighted
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/20"
                        : "bg-slate-800 text-white hover:bg-slate-700"
                    }`}
                  >
                    {tier.cta}
                  </button>
                  <ul className="space-y-4">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3 text-slate-300">
                        <svg className="h-5 w-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
            ))}
        </div>
       </section>
    )
}