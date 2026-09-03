import type { Offer } from "@/lib/content.functions";
import { formatPrice } from "@/lib/format";

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function OfferCard({ offer, showTerms = false }: { offer: Offer; showTerms?: boolean }) {
  const price = formatPrice(offer.price);
  const ends = formatDate(offer.end_date);

  return (
    <article className="group surface-card flex flex-col overflow-hidden rounded-3xl shadow-deep transition-all duration-500 hover:-translate-y-1 hover:border-accent/40">
      <div className="relative aspect-[16/10] overflow-hidden bg-charcoal">
        {offer.image_url ? (
          <img
            src={offer.image_url}
            alt={offer.title}
            loading="lazy"
            width={900}
            height={562}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : null}
        {offer.discount ? (
          <span className="absolute right-3 top-3 rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-accent-foreground">
            {offer.discount}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-2xl font-bold text-foreground">{offer.title}</h3>
        {offer.description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{offer.description}</p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
          {price ? <span className="font-display text-xl font-bold text-primary">{price}</span> : null}
          {ends ? (
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Ends {ends}
            </span>
          ) : null}
        </div>

        {showTerms && offer.terms ? (
          <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
            {offer.terms}
          </p>
        ) : null}
      </div>
    </article>
  );
}
