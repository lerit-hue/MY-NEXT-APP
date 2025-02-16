import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Define the font (optional)
const inter = Inter({ subsets: ["latin"] });

// Metadata for the application (SEO)
export const metadata: Metadata = {
  title: "E-Commerce AI Assistant",
  description: "Your personal AI-powered e-commerce assistant for product recommendations and queries.",
};

// Root layout component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-pink-200`}>
        {/* Header */}
        <header className="bg-white text-black p-4 text-center">
          <h1 className="text-2xl font-bold">E-Commerce AI Assistant</h1>
          <p className="text-sm">Your personal shopping assistant powered by Groq AI</p>
        </header>

        {/* Main Content */}
        <main className="container mx-auto p-4">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white text-center p-4 mt-8">
          <p>&copy; {new Date().getFullYear()} E-Commerce AI Assistant. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
