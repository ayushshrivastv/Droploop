import "@/styles/globals.css";

import { Inter } from "next/font/google";
import { WalletContextProvider } from "@/components/solana/wallet-provider";
import React from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Droploop - Compressed Tokens on Solana",
  description: "A compressed token (cToken) Proof-of-Participation interface using ZK Compression on Solana.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} bg-black text-white`}>
        <WalletContextProvider>
          <div className="min-h-screen flex flex-col">
            {/* Header is imported in each page to allow client-side functionality */}
            <div className="pt-16"> {/* This padding accounts for the fixed header height */}
              <main className="flex-1">
                {children}
              </main>
            </div>
            {/* Footer component is imported here */}
            <div>
              {/* Footer will be added in page components */}
            </div>
          </div>
        </WalletContextProvider>
      </body>
    </html>
  );
}
