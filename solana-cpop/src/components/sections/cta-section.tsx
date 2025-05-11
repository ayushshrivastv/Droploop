"use client";

import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-r from-black to-gray-900">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Create Your Own Compressed Tokens?
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
          Start building scalable, cost-efficient proof-of-participation experiences today 
          with our easy-to-use platform.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/create" 
            className="rounded-lg bg-purple-600 hover:bg-purple-700 px-8 py-3 text-white font-medium transition-colors"
          >
            Get Started
          </Link>
          <Link 
            href="/docs" 
            className="rounded-lg border border-gray-600 hover:border-gray-400 px-8 py-3 text-white font-medium transition-colors"
          >
            Read Documentation
          </Link>
        </div>
      </div>
    </section>
  );
}
