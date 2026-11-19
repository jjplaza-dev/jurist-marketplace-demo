"use client";

import { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { EMAIL_RE } from "@/lib/format";

const field =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-fb focus:ring-2 focus:ring-fb/30";

export default function MessageForm({ listingId, sellerEmail }: { listingId: string; sellerEmail: string }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("I want to buy your item!");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isSupabaseConfigured) return setError("Supabase is not configured yet.");
    if (!EMAIL_RE.test(email.trim())) return setError("Enter a valid email so the seller can reply.");
    if (!message.trim()) return setError("Write a message first.");

    setSending(true);
    // No .select(): the messages table is insert-only for the public key.
    const { error: insertError } = await supabase.from("messages").insert({
      listing_id: listingId,
      buyer_email: email.trim(),
      seller_email: sellerEmail,
      message: message.trim(),
    });
    setSending(false);

    if (insertError) return setError(`Message not sent: ${insertError.message}`);
    setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-800">
        <p className="font-semibold">Message sent</p>
        <p className="mt-1">The seller will get it and can reply to {email.trim()}.</p>
        <button type="button" onClick={() => { setSent(false); setMessage(""); }} className="mt-3 font-semibold underline">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <h2 className="text-sm font-semibold">Send seller a message</h2>
      <div>
        <label htmlFor="buyer-email" className="mb-1 block text-xs font-medium text-gray-600">Your email</label>
        <input id="buyer-email" type="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
      </div>
      <div>
        <label htmlFor="buyer-message" className="mb-1 block text-xs font-medium text-gray-600">Message</label>
        <textarea id="buyer-message" className={`${field} min-h-28`} value={message} maxLength={2000} onChange={(e) => setMessage(e.target.value)} />
      </div>
      {error ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-lg bg-fb py-3 font-semibold text-white transition-colors hover:bg-fb-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sending ? "Sending…" : "Message seller"}
      </button>
    </form>
  );
}
