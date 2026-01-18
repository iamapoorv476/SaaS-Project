export function Pricing() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for getting started",
      features: [
        "Up to 5 projects",
        "Basic collaboration",
        "1GB storage",
        "Email support",
      ],
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
  ];

  return (
    <section
      id="pricing"
      className="relative overflow-hidden py-24 sm:py-32 " 
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            Choose the plan that works for you
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-8 items-start">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 transition-all duration-300 flex flex-col h-full 
                ${
                  tier.highlighted
                    ? "bg-slate-900/60 border border-blue-500/50 shadow-[0_0_40px_-10px_rgba(37,99,235,0.3)] backdrop-blur-xl md:-translate-y-4" // Highlighted styles
                    : "bg-white/5 border border-white/10 hover:border-white/20 backdrop-blur-lg hover:bg-white/10" // Standard Glass styles
                }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 px-4 py-1 rounded-full text-sm font-semibold text-white shadow-lg shadow-blue-600/40">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white leading-7">
                  {tier.name}
                </h3>
                <p className="mt-2 text-sm text-slate-400 h-6">
                  {tier.description}
                </p>
              </div>

              <div className="flex items-baseline gap-x-2 mb-6">
                <span className="text-5xl font-bold tracking-tight text-white">
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-sm font-semibold leading-6 text-slate-400">
                    {tier.period}
                  </span>
                )}
              </div>

              <ul role="list" className="mb-8 space-y-3 text-sm leading-6 text-slate-300 flex-1">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex gap-x-3 items-center">
                    <svg
                      className={`h-5 w-5 flex-none ${
                        tier.highlighted ? "text-blue-400" : "text-slate-400"
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
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

              <button
                className={`w-full rounded-lg px-3 py-3 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all ${
                  tier.highlighted
                    ? "bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600 shadow-blue-500/25"
                    : "bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white"
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}