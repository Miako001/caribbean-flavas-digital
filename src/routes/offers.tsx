import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { OfferCard } from "@/components/site/OfferCard";
import { Reveal } from "@/components/site/Reveal";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { offersQuery } from "@/lib/queries";

export const Route = createFileRoute("/offers")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(offersQuery());
  },
  head: () => ({
    meta: [
      { title: "Flava Deals | Zanzé Flavours Offers" },
      {
        name: "description",
        content:
          "Current Zanzé Flavours offers and specials: combo deals, oxtail specials and limited-time weekend flavas.",
      },
      { property: "og:title", content: "Flava Deals | Zanzé Flavours" },
      { property: "og:description", content: "Good food. Better deals." },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const { data: offers } = useSuspenseQuery(offersQuery());

  return (
    <SiteLayout>
      <PageHero eyebrow="Specials" title="Flava Deals" subtitle="Good food. Better deals." />

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
        {offers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer, index) => (
              <Reveal key={offer.id} delay={Math.min(index, 5) * 70}>
                <OfferCard offer={offer} showTerms />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="surface-card rounded-3xl p-8">
            <h2 className="font-display text-2xl font-bold">No live deals right now</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              New offers drop regularly. In the meantime, the full menu is always worth a look.
            </p>
            <Link
              to="/menu"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
            >
              View Menu <ArrowRight width={16} height={16} />
            </Link>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
