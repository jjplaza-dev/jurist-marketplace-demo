import Link from "next/link";
import type { Listing } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export default function ListingCard({ listing }: { listing: Listing }) {
  const sold = listing.status === "sold";

  return (
    <Link href={`/item/${listing.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-200">
        {listing.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.image_url}
            alt={listing.title}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03] ${
              sold ? "opacity-60" : ""
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">No photo</div>
        )}
        {sold ? (
          <span className="absolute left-2 top-2 rounded-md bg-gray-900/85 px-2 py-1 text-xs font-bold uppercase tracking-wide text-white">
            Sold
          </span>
        ) : null}
      </div>
      <p className={`mt-2 text-lg font-semibold leading-tight ${sold ? "text-gray-500 line-through" : ""}`}>
        {formatPrice(listing.price)}
      </p>
      <p className="truncate text-sm text-gray-800">{listing.title}</p>
      <p className="truncate text-xs text-gray-500">{listing.location ?? "Palo Alto, CA"}</p>
    </Link>
  );
}
