import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
};

export type MenuItem = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  available: boolean;
  featured: boolean;
  popular: boolean;
  new_item: boolean;
  chefs_pick: boolean;
  spicy: boolean;
  dietary_tags: string[];
  display_order: number;
};

export type Offer = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  discount: string | null;
  start_date: string | null;
  end_date: string | null;
  terms: string | null;
  display_order: number;
};

export type Testimonial = {
  id: string;
  customer_name: string;
  review: string;
  rating: number;
  review_date: string | null;
  is_sample: boolean;
  display_order: number;
};

export type Settings = Record<string, string>;

export const getMenu = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicClient } = await import("./supabase-public.server");
  const supabase = createPublicClient();

  const [categories, items] = await Promise.all([
    supabase
      .from("menu_categories")
      .select("id, name, slug, description, display_order")
      .eq("active", true)
      .order("display_order"),
    supabase
      .from("menu_items")
      .select(
        "id, category_id, name, description, price, image_url, available, featured, popular, new_item, chefs_pick, spicy, dietary_tags, display_order",
      )
      .order("display_order"),
  ]);

  if (categories.error) throw new Error(categories.error.message);
  if (items.error) throw new Error(items.error.message);

  return {
    categories: (categories.data ?? []) as MenuCategory[],
    items: (items.data ?? []) as MenuItem[],
  };
});

export const getActiveOffers = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicClient } = await import("./supabase-public.server");
  const supabase = createPublicClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("offers")
    .select(
      "id, title, description, image_url, price, discount, start_date, end_date, terms, display_order",
    )
    .eq("active", true)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order("display_order");

  if (error) throw new Error(error.message);

  return ((data ?? []) as Offer[]).filter((o) => !o.start_date || o.start_date <= today);
});

export const getTestimonials = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicClient } = await import("./supabase-public.server");
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("testimonials")
    .select("id, customer_name, review, rating, review_date, is_sample, display_order")
    .eq("approved", true)
    .eq("visible", true)
    .order("display_order");

  if (error) throw new Error(error.message);
  return (data ?? []) as Testimonial[];
});

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicClient } = await import("./supabase-public.server");
  const supabase = createPublicClient();

  const { data, error } = await supabase.from("restaurant_settings").select("key, value");
  if (error) throw new Error(error.message);

  const settings: Settings = {};
  for (const row of data ?? []) settings[row.key] = row.value ?? "";
  return settings;
});

const feedbackSchema = z.object({
  name: z.string().trim().max(100).optional().or(z.literal("")),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  rating: z.number().int().min(1).max(5).nullable(),
  message: z.string().trim().min(1).max(2000),
  enjoyed_most: z.string().trim().max(50).optional().or(z.literal("")),
  would_recommend: z.enum(["Yes", "Maybe", "No"]).nullable(),
});

export const submitFeedback = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => feedbackSchema.parse(data))
  .handler(async ({ data }) => {
    const { createPublicClient } = await import("./supabase-public.server");
    const supabase = createPublicClient();

    const { error } = await supabase.from("feedback").insert({
      name: data.name ? data.name : null,
      email: data.email ? data.email : null,
      rating: data.rating,
      message: data.message,
      enjoyed_most: data.enjoyed_most ? data.enjoyed_most : null,
      would_recommend: data.would_recommend,
    });

    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
