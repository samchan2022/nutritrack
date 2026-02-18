"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Leaf, LogOut, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { cn } from "@/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/food-log", label: "Food Log" },
  { href: "/meal-plan", label: "Meal Plans" },
  { href: "/progress", label: "Progress" },
  { href: "/settings", label: "Settings" },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/food-log": "Food Log",
  "/meal-plan": "Meal Plans",
  "/progress": "Progress",
  "/settings": "Settings",
};

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const title = Object.entries(pageTitles).find(([path]) =>
    pathname.startsWith(path)
  )?.[1] ?? "NutriGoal";

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : session?.user?.email?.[0]?.toUpperCase() ?? "U";

  const isPremium = session?.user?.subscriptionStatus === "PREMIUM";

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 h-16 bg-white border-b border-gray-100">
      {/* Mobile menu button */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {isPremium && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
            <Crown className="h-3.5 w-3.5" />
            Premium
          </div>
        )}
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700 font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Mobile nav drawer */}
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent className="sm:max-w-xs p-0">
          <DialogHeader className="px-4 pt-4 pb-2 border-b">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600">
                <Leaf className="h-4 w-4 text-white" />
              </div>
              <DialogTitle className="text-lg font-bold">NutriGoal</DialogTitle>
            </div>
          </DialogHeader>
          <nav className="px-3 py-3 space-y-1">
            {navItems.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-3 py-2.5 rounded-lg text-sm font-medium",
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="px-3 py-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-600 hover:text-red-600"
              onClick={() => {
                setMobileOpen(false);
                signOut({ callbackUrl: "/" });
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
