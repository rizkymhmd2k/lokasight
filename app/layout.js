import { Inter, Oswald } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

const oswald = Oswald({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-oswald'
})

export const metadata = {
  title: 'My Landing Page',
  description: 'A modern 2026 landing page',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable}`}>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
