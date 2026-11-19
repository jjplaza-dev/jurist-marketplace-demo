import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MessageForm from "@/components/MessageForm";
import { supabase } from "@/lib/supabase";
import { formatPrice, timeAgo } from "@/lib/format";
import type { Listing } from "@/lib/types";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getListing(id: string): Promise<Listing | null> {
  if (!UUID_RE.test(id)) return null;
  const { data } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
  return (data as Listing | null) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  return { title: listing ? `${listing.title} · Marketplace` : "Listing not found · Marketplace" };
}

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-4 md:py-6">
      <Link href="/" className="text-sm font-medium text-fb hover:underline">← Back to Marketplace</Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex max-h-[80vh] items-center justify-center overflow-hidden rounded-2xl bg-surface">
          {listing.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listing.image_url} alt={listing.title} className="max-h-[80vh] w-full object-contain" />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center text-gray-500">No photo</div>
          )}
        </div>

        <div className="min-w-0 space-y-6">
          <div>
            <h1 className="break-words text-2xl font-bold">{listing.title}</h1>
            <p className="mt-1 text-2xl font-bold">{formatPrice(listing.price)}</p>
            <p className="mt-2 text-sm text-gray-600">
              Listed {timeAgo(listing.created_at)} in {listing.location ?? "Palo Alto, CA"}
            </p>
            <Link href={`/?category=${encodeURIComponent(listing.category)}`} className="mt-2 inline-block rounded-full bg-surface px-3 py-1 text-xs font-medium hover:bg-fb-soft">
              {listing.category}
            </Link>
          </div>

          {listing.description ? (
            <section>
              <h2 className="text-sm font-semibold">Description</h2>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-800">{listing.description}</p>
            </section>
          ) : null}

          <section>
            <h2 className="text-sm font-semibold">Seller information</h2>
            <a href={`mailto:${listing.seller_email}`} className="break-all text-sm text-fb hover:underline">
              {listing.seller_email}
            </a>
          </section>

          <MessageForm listingId={listing.id} sellerEmail={listing.seller_email} />
        </div>
      </div>
    </main>
  );
}
