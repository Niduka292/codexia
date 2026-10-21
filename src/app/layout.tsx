import type { Metadata } from "next";
import { Inter, Orbitron, Space_Grotesk } from "next/font/google";
import { BlinkingDots } from "@/components/BlinkingDots";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { SpaceTimerOverlay } from "@/components/SpaceTimerOverlay";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "CODEXIA | Voyager-1 Transmission",
  description: "A classified interstellar computer science mission.",
  icons: {
    icon: [
      { url: "/codexia-transparent.png?v=2", type: "image/png" },
    ],
    shortcut: "/codexia-transparent.png?v=2",
    apple: "/codexia-transparent.png?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${orbitron.variable} h-full scroll-smooth antialiased`}
    >
      <head>
        <link rel="icon" href="/codexia-transparent.png?v=2" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/codexia-transparent.png?v=2" />
        <link rel="apple-touch-icon" href="/codexia-transparent.png?v=2" />
      </head>
      <body className="mission-shell relative min-h-full bg-void text-white">
        <BlinkingDots />
        <Navbar />
        <SpaceTimerOverlay />
        <main className="relative z-10 min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
