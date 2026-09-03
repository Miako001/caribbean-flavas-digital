import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const adminInput =
  "w-full rounded-xl border border-input bg-background/60 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring";

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition-colors",
        checked
          ? "bg-primary text-primary-foreground"
          : "border border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  tone = "default",
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors",
        tone === "danger"
          ? "border-destructive/50 text-destructive hover:bg-destructive/10"
          : "border-border text-foreground hover:bg-secondary",
      )}
    >
      {children}
    </button>
  );
}

export function AdminCard({ children }: { children: ReactNode }) {
  return <div className="surface-card rounded-2xl p-5">{children}</div>;
}
