import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";

import { Reveal } from "@/components/site/Reveal";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { digitsOnly } from "@/lib/format";
import { settingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/contact")({
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(settingsQuery());
  },
  head: () => ({
    meta: [
      { title: "Contact Caribbean Flavas | Call, WhatsApp & Directions" },
      {
        name: "description",
        content:
          "Get in touch with Caribbean Flavas — call, message us on WhatsApp, email, or find our opening hours and directions.",
      },
      { property: "og:title", content: "Contact Caribbean Flavas" },
      { property: "og:description", content: "Come hungry. Leave happy." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: settings } = useQuery(settingsQuery());

  const phone = settings?.["phone"] ?? "";
  const whatsapp = settings?.["whatsapp"] ?? "";
  const email = settings?.["email"] ?? "";
  const address = settings?.["address"] ?? "";
  const hours = settings?.["opening_hours"] ?? "";

  const details = [
    { Icon: Phone, label: "Phone", value: phone, href: phone ? `tel:${digitsOnly(phone)}` : null },
    {
      Icon: MessageCircle,
      label: "WhatsApp",
      value: whatsapp || "Coming soon",
      href: whatsapp ? `https://wa.me/${digitsOnly(whatsapp).replace(/^\+/, "")}` : null,
    },
    { Icon: Mail, label: "Email", value: email, href: email ? `mailto:${email}` : null },
    { Icon: MapPin, label: "Address", value: address, href: null },
    { Icon: Clock, label: "Opening hours", value: hours, href: null },
  ];

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Contact"
        title="Come Say Hello"
        subtitle="Questions, orders or big appetites — we're easy to reach."
      />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-24 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8">
        <Reveal>
          <ul className="space-y-4">
            {details.map(({ Icon, label, value, href }) => (
              <li key={label} className="surface-card flex gap-4 rounded-3xl p-5">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Icon width={20} height={20} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{label}</p>
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
                      className="mt-1 block whitespace-pre-line text-base text-foreground hover:text-primary"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="mt-1 whitespace-pre-line text-base text-foreground">
                      {value || "Details coming soon"}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={90}>
          <div className="surface-card rounded-3xl p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold">Reach us fast</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The quickest way to place an order or ask about today's specials.
            </p>
            <div className="mt-6 space-y-3">
              {whatsapp ? (
                <a
                  href={`https://wa.me/${digitsOnly(whatsapp).replace(/^\+/, "")}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-tropical px-6 py-4 text-base font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
                >
                  <MessageCircle width={18} height={18} /> WhatsApp Us
                </a>
              ) : null}
              <a
                href={phone ? `tel:${digitsOnly(phone)}` : "#"}
                aria-disabled={!phone}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-gold transition-transform hover:scale-[1.02]"
              >
                <Phone width={18} height={18} /> Call Us
              </a>
              <a
                href={
                  address
                    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
                    : "#"
                }
                target="_blank"
                rel="noreferrer noopener"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-border px-6 py-4 text-base font-bold text-foreground transition-colors hover:bg-secondary"
              >
                <Navigation width={18} height={18} /> Get Directions
              </a>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Contact details are managed by the restaurant and update automatically once confirmed.
            </p>
          </div>
        </Reveal>
      </div>
    </SiteLayout>
  );
}
