import { useState } from "react";
import { toast } from "sonner";

import { Field, adminInput } from "./ui";
import { uploadImage } from "@/lib/upload";

export function ImageField({
  value,
  folder,
  onChange,
}: {
  value: string;
  folder: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  return (
    <div className="flex items-start gap-3">
      {value ? (
        <img
          src={value}
          alt="Current image preview"
          loading="lazy"
          width={72}
          height={72}
          className="h-18 w-18 shrink-0 rounded-xl object-cover"
        />
      ) : null}
      <div className="flex-1 space-y-2">
        <Field label="Image URL">
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="/images/dish.jpg"
            className={adminInput}
          />
        </Field>
        <label className="block text-xs text-muted-foreground">
          {busy ? "Uploading…" : "Or upload a photo"}
          <input
            type="file"
            accept="image/*"
            onChange={onFile}
            disabled={busy}
            className="mt-1 block w-full text-xs text-muted-foreground"
          />
        </label>
      </div>
    </div>
  );
}
