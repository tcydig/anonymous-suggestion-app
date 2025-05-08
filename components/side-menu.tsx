"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PenSquare, List, HelpCircle, Menu, MessageCircle } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const menuItems = [
  {
    title: "投稿",
    href: "/",
    icon: <PenSquare className="h-5 w-5" />,
  },
  {
    title: "一覧",
    href: "/list",
    icon: <List className="h-5 w-5" />,
  },
  {
    title: "ディスカッション",
    href: "/discussions",
    icon: <MessageCircle className="h-5 w-5" />,
  },
  {
    title: "使い方",
    href: "/how-to-use",
    icon: <HelpCircle className="h-5 w-5" />,
  },
]

export function SideMenu() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Trigger - Only visible on mobile */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-40">
              <Menu className="h-6 w-6" />
              <span className="sr-only">メニューを開く</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <div className="flex flex-col h-full bg-gradient-to-b from-purple-50 to-pink-50">
              <div className="p-4 border-b border-purple-100">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  つぶやきボックス
                </h2>
              </div>
              <nav className="flex-1 p-4">
                <ul className="space-y-2">
                  {menuItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-purple-100",
                          (item.href === "/" && pathname === "/") || 
                          (item.href !== "/" && pathname.startsWith(item.href)) 
                            ? "bg-purple-100 text-purple-700 font-medium" 
                            : "text-gray-600",
                        )}
                      >
                        {item.icon}
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Side Menu - Only visible on desktop */}
      <div className="hidden lg:flex h-screen w-64 flex-col fixed inset-y-0 left-0 border-r border-purple-100 bg-gradient-to-b from-purple-50 to-pink-50">
        <div className="p-4 border-b border-purple-100">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            つぶやきボックス
          </h2>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-purple-100",
                    (item.href === "/" && pathname === "/") || 
                    (item.href !== "/" && pathname.startsWith(item.href)) 
                      ? "bg-purple-100 text-purple-700 font-medium" 
                      : "text-gray-600",
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}

