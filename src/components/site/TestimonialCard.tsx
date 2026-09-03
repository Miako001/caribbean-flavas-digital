import { Quote } from "lucide-react";

import { StarRating } from "./StarRating";
import type { Testimonial } from "@/lib/content.functions";

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const date = formatDate(testimonial.review_date);

  return (
    <figure className="surface-card flex h-full flex-col rounded-3xl p-6 shadow-deep">
      <Quote width={22} height={22} aria-hidden="true" className="text-primary/70" />
      <blockquote className="mt-4 flex-1 text-base leading-relaxed text-foreground">
        “{testimonial.review}”
      </blockquote>
      <figcaption className="mt-5 border-t border-border pt-4">
        <StarRating rating={testimonial.rating} />
        <p className="mt-2 text-sm font-semibold text-foreground">{testimonial.customer_name}</p>
        {date ? <p className="text-xs text-muted-foreground">{date}</p> : null}
        {testimonial.is_sample ? (
          <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Sample review — placeholder until real guest reviews arrive
          </p>
        ) : null}
      </figcaption>
    </figure>
  );
}
