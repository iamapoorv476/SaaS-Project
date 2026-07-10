import { Header } from "./src/components/header"
import { Hero } from "./src/components/hero"
import { DashboardPreview } from "./src/components/dashboard-preview"
import { Features } from "./src/components/features"
import { TechStack } from "./src/components/tech-stack"
import { FinalCTA } from "./src/components/final-cta"
import { Footer } from "./src/components/footer"

export default function Home() {
  return (
    <div className="landing bg-[#F7F5EF]">
      <Header />
      <Hero />
      <DashboardPreview />
      <Features />
      <TechStack />
      <FinalCTA />
      <Footer />
    </div>
  )
}