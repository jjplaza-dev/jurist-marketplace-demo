"use client";

import { useState } from "react";

export default function BuyNowButton({ listingId, priceLabel }: { listingId: string; priceLabel: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not start checkout.");
      window.location.assign(data.url); // keep the button disabled while we navigate
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="w-full rounded-lg bg-fb py-3 font-semibold text-white transition-colors hover:bg-fb-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Opening checkout…" : `Buy Now · ${priceLabel}`}
      </button>
      {error ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
