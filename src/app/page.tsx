import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import ListingCard from "@/components/ListingCard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { isCategory } from "@/lib/categories";
import type { Listing } from "@/lib/types";

type SearchParams = Promise<{ category?: string; q?: string }>;

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const { category: rawCategory, q: rawQ } = await searchParams;
  const category = isCategory(rawCategory) ? rawCategory : undefined;
  const q = (rawQ ?? "").trim().slice(0, 100);

  let listings: Listing[] = [];
  let error: string | null = null;

  if (!isSupabaseConfigured) {
    error = "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.";
  } else {
    let query = supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (category) query = query.eq("category", category);
    // strip characters that have meaning in PostgREST filter syntax
    const term = q.replace(/[%,()*\\]/g, " ").trim();
    if (term) query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
    const res = await query;
    if (res.error) error = res.error.message;
    else listings = (res.data ?? []) as Listing[];
  }

  const heading = q ? `Results for “${q}”` : category ?? "Today’s picks";

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-4 md:flex-row md:gap-8 md:py-6">
      <Sidebar active={category} q={q || undefined} />

      <main className="min-w-0 flex-1">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">
            {heading}
            {q && category ? <span className="font-normal text-gray-500"> in {category}</span> : null}
          </h1>
          <form action="/" method="get" role="search" className="flex gap-2">
            {category ? <input type="hidden" name="category" value={category} /> : null}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search listings"
              aria-label="Search listings"
              className="w-full rounded-full bg-surface px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-fb sm:w-64"
            />
            <button type="submit" className="rounded-full bg-fb px-4 py-2 text-sm font-semibold text-white hover:bg-fb-dark">
              Search
            </button>
          </form>
        </div>

        {error ? (
          <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            Couldn’t load listings: {error}
          </p>
        ) : listings.length === 0 ? (
          <div className="rounded-xl bg-surface p-10 text-center">
            <p className="text-lg font-semibold">{q || category ? "No listings match yet" : "No listings yet"}</p>
            <p className="mt-1 text-sm text-gray-600">Be the first to list something in this spot.</p>
            <Link href="/create/item" className="mt-4 inline-block rounded-md bg-fb px-4 py-2 text-sm font-semibold text-white hover:bg-fb-dark">
              Create listing
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {listings.map((l) => (
              <li key={l.id}>
                <ListingCard listing={l} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
