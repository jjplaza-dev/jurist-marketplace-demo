import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import MessageForm from "@/components/MessageForm";
import { ItemSkeleton } from "@/components/Skeletons";
import { supabase } from "@/lib/supabase";
import { formatPrice, timeAgo } from "@/lib/format";
import type { Listing } from "@/lib/types";

// Static metadata: fetching the listing here would be uncached data outside <Suspense>.
export const metadata = { title: "Listing · Marketplace" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getListing(id: string): Promise<Listing | null> {
  if (!UUID_RE.test(id)) return null;
  const { data } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
  return (data as Listing | null) ?? null;
}

// The page shell is static. `params` and the Supabase read are awaited inside <Suspense>.
export default function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-4 md:py-6">
      <Link href="/" className="text-sm font-medium text-fb hover:underline">← Back to Marketplace</Link>
      <Suspense fallback={<ItemSkeleton />}>
        <ItemContent params={params} />
      </Suspense>
    </main>
  );
}

async function ItemContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connection(); // always read the latest listing
  const listing = await getListing(id);
  if (!listing) notFound();

  return (
    <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="flex max-h-[80vh] items-center justify-center overflow-hidden rounded-2xl bg-white p-3 shadow-sm">
        {listing.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.image_url} alt={listing.title} className="max-h-[calc(80vh-1.5rem)] w-full rounded-xl object-contain" />
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
          <Link
            href={`/?category=${encodeURIComponent(listing.category)}`}
            className="mt-2 inline-block rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium hover:bg-fb-soft"
          >
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
  );
}
