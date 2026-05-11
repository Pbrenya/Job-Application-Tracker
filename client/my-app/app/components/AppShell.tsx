"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "@/app/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/applications", label: "Applications" },
  { href: "/companies", label: "Companies" },
  { href: "/analytics", label: "Analytics" },
];

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearToken();
    router.replace("/login");
  };

  return (
    <div className="min-h-full bg-white">
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-4 px-6 py-4">
          <div className="text-sm font-semibold">Job Application Tracker</div>
          <nav className="flex flex-wrap items-center gap-3 text-sm">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-2 py-1 transition-colors ${
                    isActive
                      ? "bg-zinc-100 text-zinc-900"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            className="ml-auto rounded-md border border-zinc-300 px-3 py-1 text-sm"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-6">
        {children}
      </main>
    </div>
  );
}
