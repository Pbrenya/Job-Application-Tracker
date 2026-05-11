"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { login } from "@/app/lib/api";
import { getToken, setToken } from "@/app/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (getToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await login(email, password);
      setToken(response.token);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="text-sm text-zinc-700">
          Email
          <input
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="text-sm text-zinc-700">
          Password
          <input
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button
          type="submit"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          disabled={submitting}
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <p className="text-sm text-zinc-600">
        New here?{" "}
        <Link className="underline" href="/register">
          Create an account
        </Link>
      </p>
    </div>
  );
}
