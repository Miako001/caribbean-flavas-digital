import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ImageField } from "./ImageField";
import { AdminCard, Field, PrimaryButton, adminInput } from "./ui";
import { supabase } from "@/integrations/supabase/client";

const GROUPS: Array<{
  title: string;
  fields: Array<{ key: string; label: string; multiline?: boolean }>;
}> = [
  {
    title: "Restaurant information",
    fields: [
      { key: "restaurant_name", label: "Restaurant name" },
      { key: "tagline", label: "Tagline" },
      { key: "description", label: "Short description", multiline: true },
    ],
  },
  {
    title: "Contact",
    fields: [
      { key: "phone", label: "Phone" },
      { key: "whatsapp", label: "WhatsApp number (international format)" },
      { key: "email", label: "Email" },
      { key: "address", label: "Address", multiline: true },
      { key: "opening_hours", label: "Opening hours", multiline: true },
    ],
  },
  {
    title: "Social media",
    fields: [
      { key: "instagram", label: "Instagram URL" },
      { key: "tiktok", label: "TikTok URL" },
      { key: "facebook", label: "Facebook URL" },
    ],
  },
  {
    title: "About page story",
    fields: [
      { key: "about_intro", label: "Intro", multiline: true },
      { key: "about_flava_source", label: "Where the flava comes from", multiline: true },
      { key: "about_small_big", label: "Small restaurant. Big flava.", multiline: true },
      { key: "about_philosophy", label: "Our philosophy", multiline: true },
    ],
  },
  {
    title: "QR menu",
    fields: [{ key: "qr_menu_destination", label: "QR menu destination (path or URL)" }],
  },
];

export function SettingsManager() {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});

  const settings = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("restaurant_settings").select("key, value");
      if (error) throw new Error(error.message);
      const map: Record<string, string> = {};
      for (const row of data ?? []) map[row.key] = row.value ?? "";
      return map;
    },
  });

  useEffect(() => {
    if (settings.data) setValues(settings.data);
  }, [settings.data]);

  const save = useMutation({
    mutationFn: async (next: Record<string, string>) => {
      const rows = Object.entries(next).map(([key, value]) => ({ key, value }));
      const { error } = await supabase.from("restaurant_settings").upsert(rows, {
        onConflict: "key",
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      void queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      {GROUPS.map((group) => (
        <AdminCard key={group.title}>
          <h3 className="font-display text-lg font-bold">{group.title}</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {group.fields.map((field) => (
              <Field
                key={field.key}
                label={field.label}
                className={field.multiline ? "sm:col-span-2" : undefined}
              >
                {field.multiline ? (
                  <textarea
                    rows={3}
                    value={values[field.key] ?? ""}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [field.key]: event.target.value }))
                    }
                    className={adminInput}
                  />
                ) : (
                  <input
                    value={values[field.key] ?? ""}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [field.key]: event.target.value }))
                    }
                    className={adminInput}
                  />
                )}
              </Field>
            ))}
          </div>
        </AdminCard>
      ))}

      <AdminCard>
        <h3 className="font-display text-lg font-bold">QR code image</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload or replace the QR code shown on the menu page.
        </p>
        <div className="mt-4">
          <ImageField
            value={values["qr_code_url"] ?? ""}
            folder="qr"
            onChange={(url) => setValues((current) => ({ ...current, qr_code_url: url }))}
          />
        </div>
      </AdminCard>

      <PrimaryButton onClick={() => save.mutate(values)} disabled={save.isPending}>
        {save.isPending ? "Saving…" : "Save all settings"}
      </PrimaryButton>
    </div>
  );
}
