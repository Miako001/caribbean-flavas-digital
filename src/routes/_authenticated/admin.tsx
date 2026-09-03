import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import logoAsset from "@/assets/logo.png.asset.json";
import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { FeedbackList } from "@/components/admin/FeedbackList";
import { MenuItemsManager } from "@/components/admin/MenuItemsManager";
import { OffersManager } from "@/components/admin/OffersManager";
import { SettingsManager } from "@/components/admin/SettingsManager";
import { TestimonialsManager } from "@/components/admin/TestimonialsManager";
import { GhostButton } from "@/components/admin/ui";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Content Manager | Caribbean Flavas" },
      { name: "description", content: "Manage menu, offers, reviews and restaurant details." },
      { property: "og:title", content: "Content Manager | Caribbean Flavas" },
      { property: "og:description", content: "Restaurant content management." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const TABS = [
  { id: "menu", label: "Menu items" },
  { id: "categories", label: "Categories" },
  { id: "offers", label: "Offers" },
  { id: "testimonials", label: "Reviews" },
  { id: "settings", label: "Restaurant info" },
  { id: "feedback", label: "Feedback inbox" },
] as const;

function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("menu");

  const role = useQuery({
    queryKey: ["admin", "is-admin"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return { isAdmin: false, email: null as string | null };
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });
      if (error) throw new Error(error.message);
      return { isAdmin: Boolean(data), email: userData.user?.email ?? null };
    },
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img
              src={logoAsset.url}
              alt="Caribbean Flavas logo"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full ring-1 ring-primary/40"
            />
            <div>
              <p className="font-display text-lg font-bold">Content Manager</p>
              {role.data?.email ? (
                <p className="text-xs text-muted-foreground">{role.data.email}</p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="rounded-full border border-border px-4 py-2.5 text-sm font-semibold hover:bg-secondary"
            >
              View site
            </Link>
            <GhostButton onClick={signOut}>Sign out</GhostButton>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {role.isLoading ? (
          <p className="text-sm text-muted-foreground">Checking your access…</p>
        ) : role.data?.isAdmin ? (
          <>
            <div
              role="tablist"
              aria-label="Admin sections"
              className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto pb-4"
            >
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
                    tab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-4">
              {tab === "menu" ? <MenuItemsManager /> : null}
              {tab === "categories" ? <CategoriesManager /> : null}
              {tab === "offers" ? <OffersManager /> : null}
              {tab === "testimonials" ? <TestimonialsManager /> : null}
              {tab === "settings" ? <SettingsManager /> : null}
              {tab === "feedback" ? <FeedbackList /> : null}
            </div>
          </>
        ) : (
          <div className="surface-card rounded-3xl p-8">
            <h1 className="font-display text-2xl font-bold">Admin access needed</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Your account is signed in but doesn't have the admin role yet. Ask the restaurant
              owner to grant admin access to this account, then reload this page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
