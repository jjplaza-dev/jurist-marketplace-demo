import Link from "next/link";
import type { Listing } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export default function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link href={`/item/${listing.id}`} className="group block">
      <div className="aspect-square overflow-hidden rounded-xl bg-surface">
        {listing.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.image_url}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">No photo</div>
        )}
      </div>
      <p className="mt-2 text-lg font-semibold leading-tight">{formatPrice(listing.price)}</p>
      <p className="truncate text-sm text-gray-800">{listing.title}</p>
      <p className="truncate text-xs text-gray-500">{listing.location ?? "Palo Alto, CA"}</p>
    </Link>
  );
}
