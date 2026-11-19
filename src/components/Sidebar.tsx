import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

function href(category: string | null, q?: string) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  const s = params.toString();
  return s ? `/?${s}` : "/";
}

export default function Sidebar({ active, q }: { active?: string; q?: string }) {
  const base = "block whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors";
  const on = "bg-fb-soft font-semibold text-fb";
  const off = "text-gray-800 hover:bg-black/5";

  return (
    <nav aria-label="Categories" className="md:w-60 md:shrink-0">
      <h2 className="mb-2 hidden px-3 text-xl font-bold md:block">Categories</h2>
      <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-col md:overflow-visible md:px-0 md:pb-0">
        <li>
          <Link href={href(null, q)} className={`${base} ${!active ? on : off}`} aria-current={!active ? "page" : undefined}>
            All listings
          </Link>
        </li>
        {CATEGORIES.map((c) => (
          <li key={c}>
            <Link
              href={href(c, q)}
              className={`${base} ${active === c ? on : off}`}
              aria-current={active === c ? "page" : undefined}
            >
              {c}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
