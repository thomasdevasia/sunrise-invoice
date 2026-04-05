import { useEffect } from "react"
import { Outlet } from "react-router"

import { AppSidebar } from "~/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar"
import { Separator } from "~/components/ui/separator"
import { Switch } from "~/components/ui/switch"
import { TooltipProvider } from "~/components/ui/tooltip"
import { Moon, Sun } from "lucide-react"
import { useThemeStore } from "~/store/theme"
import { QueryProvider } from "~/components/query-provider"
import { Toaster } from "~/components/ui/sonner"

export default function App() {
  const isDark = useThemeStore((s) => s.isDark)
  const toggle = useThemeStore((s) => s.toggle)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  return (
    <QueryProvider>
      <TooltipProvider>
        <SidebarProvider defaultOpen={false}>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-12 items-center gap-2 border-b px-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-full" />
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <Sun className="size-3.5 text-muted-foreground" />
                <Switch checked={isDark} onCheckedChange={() => toggle()} />
                <Moon className="size-3.5 text-muted-foreground" />
              </div>
            </header>
            <main className="flex-1 p-4">
              <Outlet />
            </main>
            <Toaster richColors position="bottom-right" />
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </QueryProvider>
  )
}
