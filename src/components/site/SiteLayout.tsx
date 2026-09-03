import type { ReactNode } from "react";

import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

/** Standard inner page hero used on every non-home page. */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  note,
  image,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  note?: string;
  image?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden pb-14 pt-32 sm:pt-40">
      {image ? (
        <>
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-20 h-full w-full object-cover opacity-40"
          />
          <div className="hero-overlay absolute inset-0 -z-10" />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--gold)_12%,transparent),transparent_60%)]"
        />
      )}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{subtitle}</p>
        ) : null}
        {note ? (
          <p className="mt-4 max-w-xl rounded-2xl border border-border bg-card/60 px-4 py-3 text-sm text-muted-foreground">
            {note}
          </p>
        ) : null}
      </div>
    </section>
  );
}
