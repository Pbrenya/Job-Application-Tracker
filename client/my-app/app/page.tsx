"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getToken } from "@/app/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (getToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold">Job Application Tracker</h1>
      <p className="text-sm text-zinc-600">
        Sign in to manage applications, companies, notes, and analytics.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm"
          href="/login"
        >
          Log in
        </Link>
        <Link
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm"
          href="/register"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
