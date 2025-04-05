import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SideMenu } from "@/components/side-menu"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "つぶやきボックス",
  description: "スタッフからの匿名改善提案を集めるためのアプリケーション",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="flex min-h-screen">
            <SideMenu />
            <div className="flex-1 lg:ml-64">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'