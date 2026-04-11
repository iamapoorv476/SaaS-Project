import { Header } from "./src/components/header"
import { Hero } from "./src/components/hero"
import { Features } from "./src/components/features"
import { Pricing } from "./src/components/pricing"
import { FinalCTA } from "./src/components/final-cta"
import { Footer } from "./src/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      <Header />
      <Hero />
      <Features />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  )
}