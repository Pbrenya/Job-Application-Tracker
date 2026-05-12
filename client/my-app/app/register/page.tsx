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
      if (!response?.token) {
        throw new Error("Registration failed. No token returned.");
      }
      setToken(response.token);
      if (!getToken()) {
        throw new Error("Unable to save session. Check browser storage.");
      }
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create account."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="jt-auth">
      <div className="jt-auth__card">
        <span className="jt-pill">Start tracking</span>
        <div>
          <h1>Create account</h1>
          <p className="jt-auth__meta">
            Build a clean pipeline for the roles you are applying to.
          </p>
        </div>
        <form className="jt-form" onSubmit={handleSubmit}>
          <label className="jt-field">
            Email
            <input
              className="jt-input"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="jt-field">
            Password
            <input
              className="jt-input"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button
            type="submit"
            className="jt-button jt-button--primary"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create account"}
          </button>
        </form>
        {error ? <p className="jt-alert jt-alert--error">{error}</p> : null}
        <p className="jt-auth__meta">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
