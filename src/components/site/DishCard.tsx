import { Flame } from "lucide-react";

import type { MenuItem } from "@/lib/content.functions";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

function Tag({ children, tone = "gold" }: { children: string; tone?: "gold" | "blue" | "green" }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
        tone === "gold" && "bg-primary text-primary-foreground",
        tone === "blue" && "bg-accent text-accent-foreground",
        tone === "green" && "bg-tropical/20 text-tropical",
      )}
    >
      {children}
    </span>
  );
}

export function DishCard({ item }: { item: MenuItem }) {
  const price = formatPrice(item.price);
  const badges: Array<{ label: string; tone: "gold" | "blue" | "green" }> = [];
  if (item.popular) badges.push({ label: "Popular", tone: "gold" });
  if (item.chefs_pick) badges.push({ label: "Chef's Pick", tone: "blue" });
  if (item.new_item) badges.push({ label: "New", tone: "blue" });
  for (const tag of item.dietary_tags ?? []) badges.push({ label: tag, tone: "green" });

  return (
    <article
      className={cn(
        "group surface-card overflow-hidden rounded-3xl shadow-deep transition-all duration-500 hover:-translate-y-1 hover:border-primary/40",
        !item.available && "opacity-70",
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-charcoal">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            width={900}
            height={675}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Photo coming soon
          </div>
        )}
        {badges.length > 0 ? (
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {badges.slice(0, 2).map((badge) => (
              <Tag key={badge.label} tone={badge.tone}>
                {badge.label}
              </Tag>
            ))}
          </div>
        ) : null}
        {!item.available ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <span className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
              Sold out
            </span>
          </div>
        ) : null}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="flex items-center gap-1.5 font-display text-xl font-bold text-foreground">
            {item.name}
            {item.spicy ? (
              <Flame
                width={16}
                height={16}
                aria-label="Spicy"
                className="text-destructive"
              />
            ) : null}
          </h3>
          {price ? (
            <span className="shrink-0 font-display text-lg font-bold text-primary">{price}</span>
          ) : null}
        </div>
        {item.description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
        ) : null}
      </div>
    </article>
  );
}
