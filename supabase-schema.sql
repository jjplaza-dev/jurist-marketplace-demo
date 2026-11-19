-- =====================================================================
-- Mini-Marketplace schema (idempotent: safe to run more than once)
-- Run in Supabase Dashboard -> SQL Editor
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Tables ----------------------------------------------------
create table if not exists listings (
  id           uuid primary key default gen_random_uuid(),
  title        varchar(255) not null check (length(trim(title)) > 0),
  description  text,
  price        decimal(10,2) not null check (price >= 0),
  category     varchar(100) not null check (category in (
                 'Vehicles','Property Rentals','Apparel','Classifieds','Electronics',
                 'Entertainment','Family','Free Stuff','Garden & Outdoor','Hobbies',
                 'Home Goods','Home Improvement','Home Sales','Musical Instruments',
                 'Office Supplies','Pet Supplies','Sporting Goods','Toys & Games',
                 'Buy and sell groups')),
  seller_email varchar(255) not null check (seller_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  image_url    text,
  location     varchar(255) default 'Palo Alto, CA',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create table if not exists messages (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid not null references listings(id) on delete cascade,
  buyer_email  varchar(255) not null check (buyer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  seller_email varchar(255) not null,
  message      text not null check (length(trim(message)) > 0 and length(message) <= 2000),
  created_at   timestamptz default now()
);

-- ---------- Storage bucket for listing images -------------------------
-- 5 MB limit and image-only uploads; public so image URLs work in <img>.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-images', 'listing-images', true, 5242880,
        array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can upload listing images" on storage.objects;
create policy "Anyone can upload listing images" on storage.objects
  for insert with check (bucket_id = 'listing-images');

drop policy if exists "Anyone can view listing images" on storage.objects;
create policy "Anyone can view listing images" on storage.objects
  for select using (bucket_id = 'listing-images');

-- ---------- Indexes ---------------------------------------------------
create index if not exists idx_listings_category   on listings(category);
create index if not exists idx_listings_created_at on listings(created_at desc);
create index if not exists idx_messages_listing_id on messages(listing_id);

-- ---------- Row Level Security ----------------------------------------
alter table listings enable row level security;
alter table messages enable row level security;

-- Listings: public read + public create. No update/delete policy,
-- so the anon key cannot edit or remove anyone's listing (no login in v1).
drop policy if exists "Anyone can view listings"   on listings;
drop policy if exists "Anyone can create listings" on listings;
drop policy if exists "Users can update their own listings" on listings;
create policy "Anyone can view listings"   on listings for select using (true);
create policy "Anyone can create listings" on listings for insert with check (true);

-- Messages: INSERT ONLY. There is deliberately no SELECT policy, so buyer
-- emails and messages are not readable with the public anon key.
-- Read them in the Supabase dashboard (Table Editor) or with the service role.
drop policy if exists "Anyone can view messages"   on messages;
drop policy if exists "Anyone can create messages" on messages;
create policy "Anyone can create messages" on messages for insert with check (true);

-- ---------- updated_at trigger ----------------------------------------
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_listings_updated_at on listings;
create trigger update_listings_updated_at before update on listings
  for each row execute function update_updated_at_column();
