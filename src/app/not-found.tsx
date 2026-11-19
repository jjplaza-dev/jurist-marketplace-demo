import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Listing not found</h1>
      <p className="mt-2 text-gray-600">It may have been removed, or the link is wrong.</p>
      <Link href="/" className="mt-6 inline-block rounded-md bg-fb px-4 py-2 font-semibold text-white hover:bg-fb-dark">
        Browse listings
      </Link>
    </main>
  );
}
