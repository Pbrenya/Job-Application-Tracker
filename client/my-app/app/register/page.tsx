"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { register } from "@/app/lib/api";
import { getToken, setToken } from "@/app/lib/auth";

export default function RegisterPage() {
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
      const response = await register(email, password);
      setToken(response.token);
      router.replace("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create account."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold">Create account</h1>
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
          {submitting ? "Creating..." : "Create account"}
        </button>
      </form>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <p className="text-sm text-zinc-600">
        Already have an account?{" "}
        <Link className="underline" href="/login">
          Log in
        </Link>
      </p>
    </div>
  );
}
