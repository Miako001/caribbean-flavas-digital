import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Music2, Phone } from "lucide-react";

import logoAsset from "@/assets/logo.png.asset.json";
import { NAV_LINKS } from "./SiteHeader";
import { settingsQuery } from "@/lib/queries";

export function SiteFooter() {
  const { data: settings } = useQuery(settingsQuery());
  const name = settings?.["restaurant_name"] || "Zanzé Flavours";
  const socials = [
    { key: "instagram", label: "Instagram", Icon: Instagram },
    { key: "tiktok", label: "TikTok", Icon: Music2 },
    { key: "facebook", label: "Facebook", Icon: Facebook },
  ] as const;

  return (
    <footer className="border-t border-border bg-charcoal/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <img
              src={logoAsset.url}
              alt={`${name} logo`}
              loading="lazy"
              width={56}
              height={56}
              className="h-14 w-14 rounded-full ring-1 ring-primary/40"
            />
            <span className="font-display text-xl font-bold uppercase tracking-[0.16em]">
              {name}
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {settings?.["tagline"] || "Taste the Flavas of the Caribbean."}
          </p>
          <div className="mt-6 flex gap-3">
            {socials.map(({ key, label, Icon }) => {
              const href = settings?.[key];
              if (!href) return null;
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  <Icon width={18} height={18} />
                </a>
              );
            })}
          </div>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Explore</h2>
          <ul className="mt-4 space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/menu"
                hash="qr-menu"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                QR Menu
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Find Us</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {settings?.["address"] ? (
              <li className="flex gap-2.5">
                <MapPin width={16} height={16} className="mt-0.5 shrink-0 text-primary" />
                <span>{settings["address"]}</span>
              </li>
            ) : null}
            {settings?.["phone"] ? (
              <li className="flex gap-2.5">
                <Phone width={16} height={16} className="mt-0.5 shrink-0 text-primary" />
                <a href={`tel:${settings["phone"]}`} className="hover:text-primary">
                  {settings["phone"]}
                </a>
              </li>
            ) : null}
            {settings?.["email"] ? (
              <li className="flex gap-2.5">
                <Mail width={16} height={16} className="mt-0.5 shrink-0 text-primary" />
                <a href={`mailto:${settings["email"]}`} className="break-all hover:text-primary">
                  {settings["email"]}
                </a>
              </li>
            ) : null}
            {settings?.["opening_hours"] ? (
              <li className="whitespace-pre-line">{settings["opening_hours"]}</li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-4 py-6 sm:px-6 lg:px-8">
        <p className="mx-auto max-w-7xl text-xs text-muted-foreground">
          © {new Date().getFullYear()} {name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
