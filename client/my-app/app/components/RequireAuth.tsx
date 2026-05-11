"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken } from "@/app/lib/auth";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="text-sm text-zinc-600">Checking session...</div>
    );
  }

  return <>{children}</>;
}
