import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { TagIcon, UserIcon } from "@/components/icons";

const TYPES = [
  { name: "Item for sale", blurb: "Sell something you no longer need.", href: "/create/item" },
  { name: "Create multiple listings", blurb: "Bulk upload is not available yet.", href: null },
  { name: "Vehicle for sale", blurb: "Vehicle listings are not available yet.", href: null },
  { name: "Home for sale or rent", blurb: "Home listings are not available yet.", href: null },
];

// Placeholder items: shown for layout only, no behavior yet.
const SIDE_ITEMS = [
  { label: "Choose listing type", Icon: TagIcon, current: true },
  { label: "Your listings", Icon: TagIcon, current: false },
  { label: "Seller help", Icon: UserIcon, current: false },
];

export default function ChooseListingType() {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-6 md:flex-row md:gap-8">
      <aside className="h-fit rounded-xl bg-white p-4 shadow-sm md:w-64 md:shrink-0">
        <h2 className="mb-2 text-lg font-bold">Create new listing</h2>
        <ul>
          {SIDE_ITEMS.map(({ label, Icon, current }) => (
            <li key={label}>
              <button
                type="button"
                aria-current={current ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm ${
                  current ? "font-semibold" : "text-gray-700"
                } hover:bg-black/5`}
              >
                <Icon className="text-gray-500" />
                {label}
              </button>
            </li>
          ))}
        </ul>

        <h2 className="mb-2 mt-6 text-lg font-bold">Categories</h2>
        <ul className="max-h-[60vh] overflow-y-auto">
          {CATEGORIES.map((c) => (
            <li key={c}>
              <Link
                href={`/?category=${encodeURIComponent(c)}`}
                className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-black/5"
              >
                {c}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      <main className="min-w-0 flex-1">
        <h1 className="text-center text-2xl font-bold">Choose listing type</h1>
        <ul className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {TYPES.map((t) => (
            <li key={t.name}>
              {t.href ? (
                <Link
                  href={t.href}
                  className="flex h-full flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
                >
                  <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200" aria-hidden>
                    <span className="h-7 w-7 rounded-full bg-gray-300" />
                  </span>
                  <span className="font-semibold">{t.name}</span>
                  <span className="mt-2 text-sm text-gray-600">{t.blurb}</span>
                </Link>
              ) : (
                <div aria-disabled="true" className="flex h-full flex-col items-center rounded-xl bg-white/60 p-6 text-center text-gray-400">
                  <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200" aria-hidden>
                    <span className="h-7 w-7 rounded-full bg-gray-300" />
                  </span>
                  <span className="font-semibold">{t.name}</span>
                  <span className="mt-2 text-sm">{t.blurb}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
