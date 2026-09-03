import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import logoAsset from "@/assets/logo.png.asset.json";
import { settingsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/offers", label: "Offers" },
  { to: "/about", label: "About" },
  { to: "/feedback", label: "Feedback" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: settings } = useQuery(settingsQuery());
  const name = settings?.["restaurant_name"] || "Caribbean Flavas";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open
          ? "border-b border-border bg-background/92 backdrop-blur-xl"
          : "bg-gradient-to-b from-background/80 to-transparent",
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label={`${name} home`}>
          <img
            src={logoAsset.url}
            alt={`${name} logo`}
            width={48}
            height={48}
            className="h-11 w-11 rounded-full ring-1 ring-primary/40 sm:h-12 sm:w-12"
          />
          <span className="hidden font-display text-lg font-bold uppercase tracking-[0.14em] text-foreground sm:block">
            {name}
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              className="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/menu"
            className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-gold transition-transform hover:scale-[1.03] sm:inline-flex"
          >
            View Menu
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary lg:hidden"
          >
            {open ? <X width={20} height={20} /> : <Menu width={20} height={20} />}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          aria-label="Mobile"
          className="border-t border-border bg-background px-4 pb-8 pt-4 lg:hidden"
        >
          <ul className="space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: link.to === "/" }}
                  activeProps={{ className: "text-primary" }}
                  className="block rounded-2xl px-4 py-4 text-lg font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/menu"
            onClick={() => setOpen(false)}
            className="mt-4 block rounded-full bg-primary px-5 py-4 text-center text-base font-bold text-primary-foreground"
          >
            View Menu
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
