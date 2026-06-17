"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Github,
  Home,
  Mic2,
  Store,
  Tag,
  Users,
} from "lucide-react";
import { storage } from "@/lib/storage";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/labels", label: "Labels", icon: Tag },
  { href: "/attendees", label: "Attendees", icon: Users },
  { href: "/sessions", label: "Sessions", icon: Mic2 },
  { href: "/exhibitors", label: "Exhibitors", icon: Store },
];

export function Nav() {
  const pathname = usePathname();

  if (pathname.includes("/designer")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:px-8">
        <div className="flex w-full items-center justify-between gap-3 lg:w-auto">
          <div className="flex items-center gap-3">
            <div className="shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-2.5 shadow-md sm:p-3">
              <Calendar className="h-5 w-5 text-white sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="truncate text-lg font-bold text-gray-900 sm:text-xl">
                Event Badge Studio
              </h1>
              <div className="flex items-center gap-2">
                <p className="hidden text-xs text-gray-500 sm:block">
                  Next.js demo by
                </p>
                <a
                  href="https://github.com/shashi089/qr-code-layout-generate-tool"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  <Github size={12} />
                  QR Layout Tool
                </a>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (
                confirm(
                  "Clear all event data? This removes layouts, attendees, sessions, and exhibitors.",
                )
              ) {
                storage.clearAll();
                window.location.reload();
              }
            }}
            className="cursor-pointer rounded-lg border border-red-100 px-2 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 sm:text-sm lg:hidden"
          >
            Clear Data
          </button>
        </div>

        <nav className="-mx-4 flex w-full gap-1.5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:w-auto lg:px-0 lg:pb-0">
          <div className="mx-auto flex w-max gap-1.5 rounded-xl bg-gray-100 p-1.5 lg:mx-0">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive =
                href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-600 hover:bg-white/50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={18} />
                  <span className="whitespace-nowrap">{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <button
          onClick={() => {
            if (
              confirm(
                "Clear all event data? This removes layouts, attendees, sessions, and exhibitors.",
              )
            ) {
              storage.clearAll();
              window.location.reload();
            }
          }}
          className="hidden cursor-pointer rounded-lg border border-red-100 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 lg:block"
        >
          Clear Data
        </button>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-gray-50">
      <Nav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
