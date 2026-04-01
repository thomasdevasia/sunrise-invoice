import { Geist, JetBrains_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"
import { QueryProvider } from "@/components/query-provider"
import { cn } from "@/lib/utils"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSans.variable,
        "font-mono",
        jetbrainsMono.variable
      )}
    >
      <body>
        <QueryProvider>
          <ThemeProvider>
            <TooltipProvider>
              <SidebarProvider defaultOpen={false}>
                <AppSidebar />
                <SidebarInset>
                  <header className="flex h-12 items-center gap-2 border-b px-3">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="h-full" />
                  </header>
                  <main className="flex-1 p-4">{children}</main>
                </SidebarInset>
              </SidebarProvider>
            </TooltipProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
