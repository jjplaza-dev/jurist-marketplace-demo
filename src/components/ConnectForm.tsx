"use client";

import { useState } from "react";
import { EMAIL_RE } from "@/lib/format";

const field =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-fb focus:ring-2 focus:ring-fb/30";

export default function ConnectForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!EMAIL_RE.test(email.trim())) return setError("Enter the email you use on your listings.");

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not start Stripe onboarding.");
      window.location.assign(data.url); // keep the button disabled while we navigate
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="seller-email" className="mb-1 block text-sm font-medium">Your seller email</label>
        <input
          id="seller-email"
          type="email"
          className={field}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <p className="mt-1 text-xs text-gray-600">Every listing posted with this email gets a Buy Now button.</p>
      </div>

      {error ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-fb py-3 font-semibold text-white transition-colors hover:bg-fb-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Opening Stripe…" : "Connect with Stripe"}
      </button>
    </form>
  );
}
