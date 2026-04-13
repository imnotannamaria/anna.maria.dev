import type { Metadata } from "next"
import { Poppins, Space_Grotesk, Space_Mono } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import "./globals.css"

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
})

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Anna Maria",
    template: "%s · Anna Maria",
  },
  description: "Full-stack engineer building tools for developers.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}
    >
      <body className="flex min-h-screen flex-col antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          <Navbar />
          <main className="flex flex-1 flex-col pt-14">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
