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
    <div className="jt-auth">
      <div className="jt-landing">
        
        <h1>Track every application with clarity.</h1>
        <p>
          Organize companies, roles, notes, and analytics in one place with a
          calm, confident workflow.
        </p>
        <div className="jt-landing__actions">
          <Link className="jt-button jt-button--primary" href="/login">
            Log in
          </Link>
          <Link className="jt-button jt-button--outline" href="/register">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
