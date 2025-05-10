import "~/styles/globals.css";

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Solana cPOP - Proof of Participation",
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
      <body className={`font-sans ${inter.variable}`}>
        <div className="min-h-screen bg-background flex flex-col">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <h1 className="font-bold text-xl">cPOP</h1>
            </div>
          </header>
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="py-6 border-t">
            <div className="container mx-auto px-4 text-center text-muted-foreground">
              <p>© {new Date().getFullYear()} Solana cPOP - Built with ZK Compression</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
