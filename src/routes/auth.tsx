import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import logoAsset from "@/assets/logo.png.asset.json";

import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Staff Sign In | Caribbean Flavas" },
      {
        name: "description",
        content: "Sign in to manage the Caribbean Flavas menu, offers and restaurant details.",
      },
      { property: "og:title", content: "Staff Sign In | Caribbean Flavas" },
      { property: "og:description", content: "Restaurant content management sign in." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const inputClasses =
  "w-full rounded-2xl border border-input bg-card/60 px-4 py-3.5 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/admin` },
          });

    setBusy(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }
    if (mode === "signup" && !result.data.session) {
      toast.success("Check your email to confirm your account.");
      return;
    }
    navigate({ to: "/admin" });
  }

  async function onGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/admin" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md">
        <img
          src={logoAsset.url}
          alt="Caribbean Flavas logo"
          width={72}
          height={72}
          className="mx-auto h-18 w-18 rounded-full ring-1 ring-primary/40"
        />
        <h1 className="mt-6 text-center font-display text-3xl font-bold">Staff Sign In</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Manage the menu, offers, reviews and restaurant details.
        </p>

        <form onSubmit={onSubmit} className="surface-card mt-8 space-y-5 rounded-3xl p-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={cn(inputClasses, "mt-2")}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={cn(inputClasses, "mt-2")}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
          </button>

          <button
            type="button"
            onClick={onGoogle}
            className="w-full rounded-full border border-border px-6 py-3.5 text-base font-semibold transition-colors hover:bg-secondary"
          >
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-sm text-muted-foreground hover:text-primary"
          >
            {mode === "signin"
              ? "Need an account? Create one"
              : "Already have an account? Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
