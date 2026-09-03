import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import aboutInterior from "@/assets/about-interior.jpg";
import ctaSpread from "@/assets/cta-spread.jpg";
import jerkChicken from "@/assets/dish-jerk-chicken.jpg";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { TestimonialCard } from "@/components/site/TestimonialCard";
import { settingsQuery, testimonialsQuery } from "@/lib/queries";

export const Route = createFileRoute("/about")({
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(settingsQuery());
    context.queryClient.prefetchQuery(testimonialsQuery());
  },
  head: () => ({
    meta: [
      { title: "Our Story | Caribbean Flavas" },
      {
        name: "description",
        content:
          "Small restaurant. Big Flava. The story behind Caribbean Flavas — our Jamaican and Caribbean food inspiration, philosophy and hospitality.",
      },
      { property: "og:title", content: "Our Story | Caribbean Flavas" },
      { property: "og:description", content: "Small restaurant. Big Flava." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: settings } = useQuery(settingsQuery());
  const { data: testimonials } = useQuery(testimonialsQuery());

  const sections = [
    {
      title: "Where The Flava Comes From",
      body:
        settings?.["about_flava_source"] ||
        "Our food is inspired by Jamaican and wider Caribbean cooking: jerk spice over open heat, slow-cooked stews, fresh herbs, scotch bonnet warmth, and sides that make a plate feel complete.",
      image: jerkChicken,
      alt: "Grilled jerk chicken with charred spiced crust",
    },
    {
      title: "Small Restaurant. Big Flava.",
      body:
        settings?.["about_small_big"] ||
        "We are a small kitchen, and that is on purpose. Smaller means we can care about every plate, season properly, cook to order where we can, and treat every guest like family.",
      image: aboutInterior,
      alt: "Warm, dimly lit Caribbean restaurant dining room",
    },
    {
      title: "Our Philosophy",
      body:
        settings?.["about_philosophy"] ||
        "Food first. Culture always. Hospitality that feels warm. And a community we want to keep feeding for a long time.",
      image: ctaSpread,
      alt: "Caribbean table spread with jerk meats, rice and peas and tropical drinks",
    },
  ];

  return (
    <SiteLayout>
      <PageHero
        eyebrow="About us"
        title="Our Story"
        subtitle="Small restaurant. Big Flava."
        image={aboutInterior}
      />

      <section className="mx-auto max-w-3xl px-4 pb-6 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-lg leading-relaxed text-muted-foreground">
            {settings?.["about_intro"] ||
              "Caribbean Flavas brings the bold, vibrant flavours of Jamaica and the Caribbean to your plate."}
          </p>
        </Reveal>
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        {sections.map((section, index) => (
          <section
            key={section.title}
            className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
              index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
            }`}
          >
            <Reveal>
              <div className="overflow-hidden rounded-3xl border border-border shadow-deep">
                <img
                  src={section.image}
                  alt={section.alt}
                  loading="lazy"
                  width={1280}
                  height={960}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={90}>
              <SectionHeading title={section.title} />
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">{section.body}</p>
            </Reveal>
          </section>
        ))}
      </div>

      <section
        id="reviews"
        aria-labelledby="reviews-heading"
        className="island-texture border-t border-border py-20 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Reviews"
              title="From Our Flava Family"
              subtitle="Reviews shared by the people who eat with us."
            />
          </Reveal>
          {(testimonials ?? []).length > 0 ? (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(testimonials ?? []).map((testimonial, index) => (
                <Reveal key={testimonial.id} delay={Math.min(index, 5) * 70}>
                  <TestimonialCard testimonial={testimonial} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted-foreground">
              Reviews will appear here as guests share them.
            </p>
          )}
          <Reveal className="mt-10">
            <Link
              to="/feedback"
              className="inline-flex items-center gap-2 rounded-full border border-accent/60 px-6 py-3 text-sm font-bold text-accent transition-colors hover:bg-accent/10"
            >
              Share your own flava <ArrowRight width={16} height={16} />
            </Link>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
