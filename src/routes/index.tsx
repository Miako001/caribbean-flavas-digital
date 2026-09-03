import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Flame, Leaf, Sparkles, Users } from "lucide-react";

import aboutInterior from "@/assets/about-interior.jpg";
import ctaSpread from "@/assets/cta-spread.jpg";
import heroImage from "@/assets/hero-jerk-platter.jpg";
import { DishCard } from "@/components/site/DishCard";
import { OfferCard } from "@/components/site/OfferCard";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SiteLayout } from "@/components/site/SiteLayout";
import { TestimonialCard } from "@/components/site/TestimonialCard";
import { menuQuery, offersQuery, settingsQuery, testimonialsQuery } from "@/lib/queries";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(menuQuery());
    context.queryClient.prefetchQuery(offersQuery());
    context.queryClient.prefetchQuery(testimonialsQuery());
    context.queryClient.prefetchQuery(settingsQuery());
  },
  head: () => ({
    meta: [
      { title: "Caribbean Flavas | Jamaican & Caribbean Food" },
      {
        name: "description",
        content:
          "Bold Jamaican-inspired flavours, good vibes, and food made to leave you wanting more. Jerk chicken, oxtail, jerked goat and reggae fries.",
      },
      { property: "og:title", content: "Caribbean Flavas | Taste the Flavas of the Caribbean" },
      {
        property: "og:description",
        content: "Jamaican soul. Caribbean flavour. Modern experience.",
      },
    ],
  }),
  component: HomePage,
});

const WHY = [
  {
    Icon: Flame,
    title: "Big Flava",
    body: "Bold Jamaican-inspired flavours in every bite.",
  },
  {
    Icon: Leaf,
    title: "Freshly Made",
    body: "Good food starts with fresh ingredients and proper preparation.",
  },
  {
    Icon: Sparkles,
    title: "Island Vibes",
    body: "A relaxed atmosphere inspired by the warmth and energy of the Caribbean.",
  },
  {
    Icon: Users,
    title: "Good People. Good Food.",
    body: "A small restaurant focused on great food, great service, and happy customers.",
  },
];

function HomePage() {
  const { data: menu } = useSuspenseQuery(menuQuery());
  const { data: offers } = useQuery(offersQuery());
  const { data: testimonials } = useQuery(testimonialsQuery());
  const { data: settings } = useQuery(settingsQuery());

  const featured = menu.items.filter((item) => item.featured).slice(0, 4);
  const topOffers = (offers ?? []).slice(0, 3);
  const topReviews = (testimonials ?? []).slice(0, 3);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative isolate flex min-h-[92svh] items-end overflow-hidden">
        <img
          src={heroImage}
          alt="Jerk chicken platter with rice and peas, fried plantain and grilled corn"
          width={1920}
          height={1280}
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="hero-overlay absolute inset-0 -z-10" />

        <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-36 sm:px-6 sm:pb-28 lg:px-8">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
              Jamaican soul · Caribbean flavour
            </p>
            <h1 className="mt-5 font-display text-[2.6rem] font-bold leading-[1.02] sm:text-6xl lg:text-7xl">
              Taste the <span className="text-gold-gradient">Flavas</span> of the Caribbean
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Bold Jamaican-inspired flavours, good vibes, and food made to leave you wanting more.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/menu"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-bold text-primary-foreground shadow-gold transition-transform hover:scale-[1.03]"
              >
                Explore Our Menu
                <ArrowRight width={18} height={18} />
              </Link>
              <Link
                to="/offers"
                className="inline-flex items-center justify-center rounded-full border border-accent/60 px-7 py-4 text-base font-bold text-accent transition-colors hover:bg-accent/10"
              >
                View Today's Offers
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURED */}
      <section className="island-texture py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Featured"
              title="What's Cooking?"
              subtitle="A taste of Jamaica, served with serious flava."
            />
          </Reveal>

          {featured.length > 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((item, index) => (
                <Reveal key={item.id} delay={index * 80}>
                  <DishCard item={item} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="mt-10 text-sm text-muted-foreground">
              Featured dishes are being plated. Check the full menu in the meantime.
            </p>
          )}

          <Reveal className="mt-10">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-primary hover:gap-3 transition-all"
            >
              See the full menu <ArrowRight width={16} height={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* OFFERS */}
      {topOffers.length > 0 ? (
        <section className="border-y border-border bg-charcoal/40 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <SectionHeading
                eyebrow="Flava deals"
                title="More Flava. More Reasons to Come Back."
                subtitle="Check out what's cooking — and what's on special."
              />
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {topOffers.map((offer, index) => (
                <Reveal key={offer.id} delay={index * 80}>
                  <OfferCard offer={offer} />
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-10">
              <Link
                to="/offers"
                className="inline-flex items-center gap-2 rounded-full border border-primary/50 px-6 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
              >
                See All Offers <ArrowRight width={16} height={16} />
              </Link>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* WHY */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="Why us" title="Why Caribbean Flavas?" />
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map(({ Icon, title, body }, index) => (
              <Reveal key={title} delay={index * 70}>
                <div className="surface-card h-full rounded-3xl p-6 transition-colors hover:border-primary/40">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <Icon width={22} height={22} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold uppercase tracking-[0.08em]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT PREVIEW */}
      <section className="pb-20 sm:pb-28">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <Reveal>
            <div className="overflow-hidden rounded-3xl border border-border shadow-deep">
              <img
                src={aboutInterior}
                alt="Warm, dimly lit Caribbean restaurant dining room"
                loading="lazy"
                width={1280}
                height={1280}
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <SectionHeading eyebrow="Our story" title="A Little Taste of the Islands" />
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              {settings?.["about_intro"] ||
                "Caribbean Flavas brings the bold, vibrant flavours of Jamaica and the Caribbean to your plate. We're a small restaurant with big flava, serving food inspired by the culture, flavours, and spirit of the islands."}
            </p>
            <Link
              to="/about"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-accent transition-all hover:gap-3"
            >
              Discover Our Story <ArrowRight width={16} height={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {topReviews.length > 0 ? (
        <section className="island-texture border-t border-border py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <SectionHeading eyebrow="Reviews" title="What Our Flava Family Says" />
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {topReviews.map((testimonial, index) => (
                <Reveal key={testimonial.id} delay={index * 80}>
                  <TestimonialCard testimonial={testimonial} />
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-10">
              <Link
                to="/about"
                hash="reviews"
                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-primary transition-all hover:gap-3"
              >
                Read More Reviews <ArrowRight width={16} height={16} />
              </Link>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* FINAL CTA */}
      <section className="relative isolate overflow-hidden">
        <img
          src={ctaSpread}
          alt="Caribbean feast of jerk meats, rice and peas, plantain and tropical drinks"
          loading="lazy"
          width={1920}
          height={1088}
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-background/78" />
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <Reveal>
            <h2 className="font-display text-4xl font-bold sm:text-5xl">Ready for Some Flava?</h2>
            <p className="mt-4 text-lg text-muted-foreground">Come hungry. Leave happy.</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/menu"
                className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-gold transition-transform hover:scale-[1.03]"
              >
                View Menu
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full border border-border px-8 py-4 text-base font-bold text-foreground transition-colors hover:bg-secondary"
              >
                Contact Us
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
