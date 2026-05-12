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
      <div className="jt-auth">
        <div className="jt-auth__card">
          <span className="jt-pill">One moment</span>
          <div>
            <h1>Checking session...</h1>
            <p className="jt-auth__meta">
              Verifying your access before loading your dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
