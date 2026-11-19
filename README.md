# Mini-Marketplace

Next.js 15 (App Router) + React 19 + Tailwind 3 + Supabase (Postgres + Storage). No login.

## 1. Supabase
1. Create a project at supabase.com.
2. SQL Editor -> paste `supabase-schema.sql` -> Run (safe to re-run).
3. Settings -> API: copy the Project URL and the `anon` public key.

## 2. Run locally
```bash
npm install
cp .env.example .env.local   # fill in both values
npm run dev
```

## 3. Deploy to Vercel
1. Push to GitHub, then import the repo in Vercel.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` under Project Settings -> Environment Variables.
3. Deploy and share the public URL.

## Routes
- `/` browse, category sidebar (`?category=`), keyword search (`?q=`)
- `/create` choose listing type, `/create/item` create listing with photo upload
- `/item/[id]` listing detail + Message Seller

## Where things are stored
- Listings: `listings` table. Photos: `listing-images` bucket.
- Buyer messages: `messages` table. It is insert-only for the public key, so read messages in the
  Supabase Table Editor (or add an email step later, e.g. a Database Webhook + Resend).

## Prerendering notes
Pages that read live data (`/` and `/item/[id]`) await `searchParams` / `params` and call
`await connection()` inside a `<Suspense>` boundary. The shell prerenders; listings stream in per request.
This works on Next 15 and on Next 16 with `cacheComponents` enabled (no `export const dynamic` is used).
