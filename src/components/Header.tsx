import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="Marketplace home">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-fb text-xl font-bold text-white">
            F
          </span>
          <span className="text-lg font-bold">Marketplace</span>
        </Link>
        <Link
          href="/create"
          className="rounded-md bg-fb px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fb-dark"
        >
          Create listing
        </Link>
      </div>
    </header>
  );
}
