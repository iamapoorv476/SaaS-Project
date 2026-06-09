import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const geistSans = Geist({ 
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "ProjectFlow — Multi-Tenant AI Platform",
  description: "Organizations upload documents, generate scoped API keys, and chat with an AI that answers strictly from their own content. Powered by LangGraph, CrewAI, and RAGAS.",
  openGraph: {
    title: "ProjectFlow — Multi-Tenant AI Platform",
    description: "RAG pipeline, LangGraph ReAct agents, CrewAI multi-agent analysis, and RAGAS quality evaluation. Live in production.",
    url: "https://saa-s-project-k7ku.vercel.app",
    siteName: "ProjectFlow",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProjectFlow — Multi-Tenant AI Platform",
    description: "RAG pipeline, LangGraph ReAct agents, CrewAI multi-agent analysis, and RAGAS quality evaluation.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}