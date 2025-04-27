import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sawty Voting',
  description: 'Secure, transparent, and privacy-preserving voting system',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
