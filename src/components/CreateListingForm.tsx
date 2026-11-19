"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, IMAGE_BUCKET, MAX_IMAGE_BYTES, ALLOWED_IMAGE_TYPES, isSupabaseConfigured } from "@/lib/supabase";
import { CATEGORIES } from "@/lib/categories";
import { EMAIL_RE, formatPrice } from "@/lib/format";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const field =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-fb focus:ring-2 focus:ring-fb/30";

export default function CreateListingForm() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  function pickFile(f: File | undefined | null) {
    if (!f) return;
    if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
      setError("Photo must be a JPG, PNG, WebP or GIF.");
      return;
    }
    if (f.size > MAX_IMAGE_BYTES) {
      setError("Photo must be smaller than 5 MB.");
      return;
    }
    setError(null);
    setFile(f);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const priceNum = Number(price);
    if (!isSupabaseConfigured) return setError("Supabase is not configured yet. Add the environment variables and redeploy.");
    if (!file) return setError("Add a photo of your item.");
    if (!title.trim()) return setError("Enter a title.");
    if (price === "" || Number.isNaN(priceNum) || priceNum < 0 || priceNum > 99999999) return setError("Enter a valid price (0 or more).");
    if (!category) return setError("Choose a category.");
    if (!EMAIL_RE.test(email.trim())) return setError("Enter a valid email address.");

    setSubmitting(true);
    try {
      const path = `${crypto.randomUUID()}.${EXT[file.type]}`;
      const up = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
        contentType: file.type,
        cacheControl: "31536000",
      });
      if (up.error) throw new Error(`Photo upload failed: ${up.error.message}`);

      const { data: pub } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);

      const { data, error: insertError } = await supabase
          .from("listings")
          .insert({
            title: title.trim(),
            description: description.trim() || null,
            price: Math.round(priceNum * 100) / 100,
            category,
            seller_email: email.trim(),
            image_url: pub.publicUrl,
          })
          .select("id")
          .single();
      if (insertError) throw new Error(insertError.message);

      router.push(`/item/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setSubmitting(false);
    }
  }

  return (
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <h1 className="text-2xl font-bold">Item for sale</h1>

          <div>
            <input
                ref={fileInput}
                id="photo"
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                className="sr-only"
                onChange={(e) => pickFile(e.target.files?.[0])}
            />
            <label
                htmlFor="photo"
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files?.[0]); }}
                className={`flex h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed text-sm transition-colors ${
                    dragging ? "border-fb bg-fb-soft" : "border-gray-300 bg-surface hover:border-fb"
                }`}
            >
              {file ? (
                  <span className="px-2 text-center font-medium">{file.name} <span className="text-fb">(change)</span></span>
              ) : (
                  <>
                    <span className="text-lg font-semibold">Add photo</span>
                    <span className="text-gray-600">Click or drop an image, up to 5 MB</span>
                  </>
              )}
            </label>
          </div>

          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium">Title</label>
            <input id="title" className={field} value={title} maxLength={255} onChange={(e) => setTitle(e.target.value)} placeholder="Bike 24 inch" />
          </div>

          <div>
            <label htmlFor="price" className="mb-1 block text-sm font-medium">Price (USD)</label>
            <input id="price" className={field} type="number" inputMode="decimal" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="99" />
          </div>

          <div>
            <label htmlFor="category" className="mb-1 block text-sm font-medium">Category</label>
            <select id="category" className={field} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">Your email</label>
            <input id="email" className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium">Description</label>
            <textarea id="description" className={`${field} min-h-28`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Condition, size, pickup details" />
          </div>

          {error ? (
              <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
          ) : null}

          <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-fb py-3 font-semibold text-white transition-colors hover:bg-fb-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Publishing…" : "Publish listing"}
          </button>
        </form>

        <aside aria-label="Listing preview" className="min-w-0">
          <p className="mb-2 text-sm font-semibold text-gray-600">Preview</p>
          <div className="grid gap-6 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-[1fr_260px]">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gray-100">
              {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="Preview of your photo" className="h-full w-full object-cover" />
              ) : (
                  <span className="text-sm text-gray-500">Your photo appears here</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{title || "Title"}</h2>
              <p className="text-lg font-bold">{price !== "" && !Number.isNaN(Number(price)) ? formatPrice(price) : "Price"}</p>
              <p className="mt-3 text-sm text-gray-600">Listed just now in Palo Alto, CA</p>
              {category ? <p className="mt-1 text-sm text-gray-600">{category}</p> : null}
              <p className="mt-4 text-sm font-semibold">Seller information</p>
              <p className="break-all text-sm text-gray-700">{email || "your@email.com"}</p>
              {description ? <p className="mt-4 whitespace-pre-wrap break-words text-sm">{description}</p> : null}
            </div>
          </div>
        </aside>
      </div>
  );
}