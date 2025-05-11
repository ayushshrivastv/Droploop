"use client";

import Link from "next/link";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import CTASection from "@/components/sections/cta-section";
import { useEffect, useState } from "react";

export default function HomePage() {
  // Client-side only rendering
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted ? (
    <>
      <Header />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-fuchsia-600 to-rose-600 text-white">
        {/* Decorative background circles */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[800px] w-[800px] rounded-full bg-white/5 blur-3xl" />
        <div className="container relative z-10 mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 py-24 text-center">
          <h1 className="mb-6 max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Build &amp; Share Compressed Participation Tokens Seamlessly
          </h1>
          <p className="mb-10 max-w-2xl text-lg font-medium text-white/90 sm:text-xl md:text-2xl">
            Droploop lets you create scalable, cost-efficient Proof-of-Participation tokens on Solana using cutting-edge ZK Compression.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/create" className="rounded-md bg-white px-8 py-3 text-base font-semibold text-black shadow transition-colors hover:bg-gray-200 sm:text-lg">
              Get Started
            </Link>
            <Link href="/docs" className="rounded-md border border-white/30 px-8 py-3 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/10 sm:text-lg">
              Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Information / Features Section */}
      <section id="features" className="bg-background py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">Why Droploop?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            We combine Solana’s blazing performance with Zero-Knowledge Compression to bring you the next generation of on-chain participation tokens.
          </p>

          <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
              <h3 className="mb-4 text-xl font-semibold">Massive Cost Savings</h3>
              <p className="text-sm text-muted-foreground">
                Mint thousands of tokens for a fraction of the cost thanks to state compression and batched proofs.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
              <h3 className="mb-4 text-xl font-semibold">Built-in Verifiability</h3>
              <p className="text-sm text-muted-foreground">
                Each token comes with a Merkle proof so anyone can verify ownership without revealing sensitive data.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
              <h3 className="mb-4 text-xl font-semibold">Seamless UX</h3>
              <p className="text-sm text-muted-foreground">
                Powerful SDKs &amp; no-code dashboards let you launch campaigns in minutes, not weeks.
              </p>
            </div>

            {/* Card 4 */}
            <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
              <h3 className="mb-4 text-xl font-semibold">Eco-Friendly</h3>
              <p className="text-sm text-muted-foreground">
                Compression reduces on-chain footprint, minimising environmental impact of your campaigns.
              </p>
            </div>

            {/* Card 5 */}
            <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
              <h3 className="mb-4 text-xl font-semibold">Analytics &amp; Insights</h3>
              <p className="text-sm text-muted-foreground">
                Real-time dashboards provide deep insights into participation and engagement metrics.
              </p>
            </div>

            {/* Card 6 */}
            <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
              <h3 className="mb-4 text-xl font-semibold">Open-Source &amp; Extensible</h3>
              <p className="text-sm text-muted-foreground">
                Fork the code, integrate with your stack, or contribute back – Droploop is built for builders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <CTASection />
      
      <Footer />
    </>
  ) : null;
}
