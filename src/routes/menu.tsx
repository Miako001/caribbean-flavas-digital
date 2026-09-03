import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { QrCode } from "lucide-react";
import { useMemo, useState } from "react";

import { DishCard } from "@/components/site/DishCard";
import { Reveal } from "@/components/site/Reveal";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { menuQuery, settingsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menu")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(menuQuery());
    context.queryClient.prefetchQuery(settingsQuery());
  },
  head: () => ({
    meta: [
      { title: "Our Menu | Caribbean Flavas" },
      {
        name: "description",
        content:
          "Browse the Caribbean Flavas menu: jerk chicken, flavoured oxtail, jerked goat, reggae fries, Caribbean sides, drinks and specials.",
      },
      { property: "og:title", content: "Our Menu | Caribbean Flavas" },
      {
        property: "og:description",
        content: "Bold flavours. Caribbean soul. Something for everyone.",
      },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { data: menu } = useSuspenseQuery(menuQuery());
  const { data: settings } = useQuery(settingsQuery());
  const [active, setActive] = useState<string>("all");

  const categories = useMemo(
    () => menu.categories.filter((c) => menu.items.some((i) => i.category_id === c.id)),
    [menu],
  );

  const visibleItems = useMemo(() => {
    if (active === "all") return menu.items;
    return menu.items.filter((item) => item.category_id === active);
  }, [menu.items, active]);

  const groups = useMemo(() => {
    if (active !== "all") {
      const category = categories.find((c) => c.id === active);
      return [{ id: active, name: category?.name ?? "Menu", items: visibleItems }];
    }
    const grouped = categories.map((category) => ({
      id: category.id,
      name: category.name,
      items: menu.items.filter((item) => item.category_id === category.id),
    }));
    const uncategorised = menu.items.filter((item) => !item.category_id);
    if (uncategorised.length > 0) {
      grouped.push({ id: "other", name: "More Flava", items: uncategorised });
    }
    return grouped;
  }, [active, categories, menu.items, visibleItems]);

  const qrUrl = settings?.["qr_code_url"];

  return (
    <SiteLayout>
      <PageHero
        eyebrow="The food"
        title="Our Menu"
        subtitle="Bold flavours. Caribbean soul. Something for everyone."
        note="Our menu changes from time to time, so there's always something new to discover."
      />

      {/* Categories: horizontally scrollable on mobile */}
      <div className="sticky top-[4.5rem] z-40 border-y border-border bg-background/92 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            role="tablist"
            aria-label="Menu categories"
            className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto py-3"
          >
            {[{ id: "all", name: "All" }, ...categories].map((category) => (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={active === category.id}
                onClick={() => setActive(category.id)}
                className={cn(
                  "shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
                  active === category.id
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        {groups
          .filter((group) => group.items.length > 0)
          .map((group) => (
            <section key={group.id} aria-labelledby={`cat-${group.id}`}>
              <h2
                id={`cat-${group.id}`}
                className="font-display text-2xl font-bold text-foreground sm:text-3xl"
              >
                {group.name}
              </h2>
              <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item, index) => (
                  <Reveal key={item.id} delay={Math.min(index, 5) * 60}>
                    <DishCard item={item} />
                  </Reveal>
                ))}
              </div>
            </section>
          ))}

        {menu.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            The menu is being updated right now. Please check back shortly.
          </p>
        ) : null}

        {/* Discreet QR menu block */}
        <section
          id="qr-menu"
          aria-labelledby="qr-heading"
          className="surface-card flex flex-col items-start gap-6 rounded-3xl p-6 sm:flex-row sm:items-center sm:p-8"
        >
          <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-accent">
            <QrCode width={26} height={26} aria-hidden="true" />
          </span>
          <div className="flex-1">
            <h2 id="qr-heading" className="font-display text-xl font-bold">
              Already at Caribbean Flavas?
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Scan our menu and explore what's available.
            </p>
          </div>
          {qrUrl ? (
            <img
              src={qrUrl}
              alt="QR code linking to the Caribbean Flavas digital menu"
              loading="lazy"
              width={128}
              height={128}
              className="h-32 w-32 rounded-2xl bg-cream p-2"
            />
          ) : (
            <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-xs text-muted-foreground">
              QR code coming soon
            </p>
          )}
        </section>
      </div>
    </SiteLayout>
  );
}
