import Link from "next/link";

const TYPES = [
  { name: "Item for sale", blurb: "Sell something you no longer need.", href: "/create/item" },
  { name: "Create multiple listings", blurb: "Bulk upload is not available yet.", href: null },
  { name: "Vehicle for sale", blurb: "Vehicle listings are not available yet.", href: null },
  { name: "Home for sale or rent", blurb: "Home listings are not available yet.", href: null },
];

export default function ChooseListingType() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">Choose listing type</h1>
      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TYPES.map((t) => (
          <li key={t.name}>
            {t.href ? (
              <Link
                href={t.href}
                className="flex h-full flex-col items-center rounded-xl border border-gray-200 p-5 text-center shadow-sm transition-colors hover:border-fb hover:bg-fb-soft"
              >
                <span className="mb-3 h-12 w-12 rounded-full bg-fb-soft" aria-hidden />
                <span className="font-semibold">{t.name}</span>
                <span className="mt-1 text-xs text-gray-600">{t.blurb}</span>
              </Link>
            ) : (
              <div aria-disabled="true" className="flex h-full flex-col items-center rounded-xl border border-gray-100 bg-gray-50 p-5 text-center text-gray-400">
                <span className="mb-3 h-12 w-12 rounded-full bg-gray-200" aria-hidden />
                <span className="font-semibold">{t.name}</span>
                <span className="mt-1 text-xs">{t.blurb}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
