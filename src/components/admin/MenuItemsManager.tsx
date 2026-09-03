import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { ImageField } from "./ImageField";
import { AdminCard, Field, GhostButton, PrimaryButton, Toggle, adminInput } from "./ui";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number | string | null;
  image_url: string | null;
  available: boolean;
  featured: boolean;
  popular: boolean;
  new_item: boolean;
  chefs_pick: boolean;
  spicy: boolean;
  dietary_tags: string[];
  display_order: number;
};

type Draft = {
  category_id: string | null;
  name: string;
  description: string;
  price: string;
  image_url: string;
  available: boolean;
  featured: boolean;
  popular: boolean;
  new_item: boolean;
  chefs_pick: boolean;
  spicy: boolean;
  dietary_tags: string;
  display_order: string;
};

const emptyDraft: Draft = {
  category_id: null,
  name: "",
  description: "",
  price: "",
  image_url: "",
  available: true,
  featured: false,
  popular: false,
  new_item: false,
  chefs_pick: false,
  spicy: false,
  dietary_tags: "",
  display_order: "0",
};

function toDraft(row: Row): Draft {
  return {
    category_id: row.category_id,
    name: row.name,
    description: row.description ?? "",
    price: row.price === null ? "" : String(row.price),
    image_url: row.image_url ?? "",
    available: row.available,
    featured: row.featured,
    popular: row.popular,
    new_item: row.new_item,
    chefs_pick: row.chefs_pick,
    spicy: row.spicy,
    dietary_tags: (row.dietary_tags ?? []).join(", "),
    display_order: String(row.display_order),
  };
}

function toPayload(draft: Draft) {
  return {
    category_id: draft.category_id,
    name: draft.name.trim(),
    description: draft.description.trim() || null,
    price: draft.price.trim() === "" ? null : Number(draft.price),
    image_url: draft.image_url.trim() || null,
    available: draft.available,
    featured: draft.featured,
    popular: draft.popular,
    new_item: draft.new_item,
    chefs_pick: draft.chefs_pick,
    spicy: draft.spicy,
    dietary_tags: draft.dietary_tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    display_order: Number(draft.display_order) || 0,
  };
}

function ItemForm({
  draft,
  setDraft,
  categories,
  onSave,
  onDelete,
  saving,
  saveLabel,
}: {
  draft: Draft;
  setDraft: (draft: Draft) => void;
  categories: Array<{ id: string; name: string }>;
  onSave: () => void;
  onDelete?: () => void;
  saving: boolean;
  saveLabel: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            className={adminInput}
          />
        </Field>
        <Field label="Category">
          <select
            value={draft.category_id ?? ""}
            onChange={(event) =>
              setDraft({ ...draft, category_id: event.target.value || null })
            }
            className={adminInput}
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Description">
        <textarea
          rows={3}
          value={draft.description}
          onChange={(event) => setDraft({ ...draft, description: event.target.value })}
          className={adminInput}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Price">
          <input
            type="number"
            step="0.01"
            value={draft.price}
            onChange={(event) => setDraft({ ...draft, price: event.target.value })}
            className={adminInput}
          />
        </Field>
        <Field label="Display order">
          <input
            type="number"
            value={draft.display_order}
            onChange={(event) => setDraft({ ...draft, display_order: event.target.value })}
            className={adminInput}
          />
        </Field>
        <Field label="Dietary tags (comma separated)">
          <input
            value={draft.dietary_tags}
            onChange={(event) => setDraft({ ...draft, dietary_tags: event.target.value })}
            className={adminInput}
          />
        </Field>
      </div>

      <ImageField
        value={draft.image_url}
        folder="menu"
        onChange={(url) => setDraft({ ...draft, image_url: url })}
      />

      <div className="flex flex-wrap gap-2">
        <Toggle
          label="Available"
          checked={draft.available}
          onChange={(value) => setDraft({ ...draft, available: value })}
        />
        <Toggle
          label="Featured"
          checked={draft.featured}
          onChange={(value) => setDraft({ ...draft, featured: value })}
        />
        <Toggle
          label="Popular"
          checked={draft.popular}
          onChange={(value) => setDraft({ ...draft, popular: value })}
        />
        <Toggle
          label="New"
          checked={draft.new_item}
          onChange={(value) => setDraft({ ...draft, new_item: value })}
        />
        <Toggle
          label="Chef's pick"
          checked={draft.chefs_pick}
          onChange={(value) => setDraft({ ...draft, chefs_pick: value })}
        />
        <Toggle
          label="Spicy"
          checked={draft.spicy}
          onChange={(value) => setDraft({ ...draft, spicy: value })}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <PrimaryButton onClick={onSave} disabled={saving || !draft.name.trim()}>
          {saving ? "Saving…" : saveLabel}
        </PrimaryButton>
        {onDelete ? (
          <GhostButton tone="danger" onClick={onDelete}>
            Delete
          </GhostButton>
        ) : null}
      </div>
    </div>
  );
}

export function MenuItemsManager() {
  const queryClient = useQueryClient();
  const [newDraft, setNewDraft] = useState<Draft>(emptyDraft);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  const items = useQuery({
    queryKey: ["admin", "menu_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("display_order");
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as Row[];
    },
  });

  const categories = useQuery({
    queryKey: ["admin", "menu_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_categories")
        .select("id, name")
        .order("display_order");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ["admin", "menu_items"] });
    void queryClient.invalidateQueries({ queryKey: ["menu"] });
  }

  const create = useMutation({
    mutationFn: async (draft: Draft) => {
      const { error } = await supabase.from("menu_items").insert(toPayload(draft));
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setNewDraft(emptyDraft);
      invalidate();
      toast.success("Dish added");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, draft }: { id: string; draft: Draft }) => {
      const { error } = await supabase.from("menu_items").update(toPayload(draft)).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Dish updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Dish deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <AdminCard>
        <h3 className="font-display text-lg font-bold">Add a dish</h3>
        <div className="mt-4">
          <ItemForm
            draft={newDraft}
            setDraft={setNewDraft}
            categories={categories.data ?? []}
            onSave={() => create.mutate(newDraft)}
            saving={create.isPending}
            saveLabel="Add dish"
          />
        </div>
      </AdminCard>

      <div className="space-y-3">
        {(items.data ?? []).map((row) => {
          const draft = drafts[row.id] ?? toDraft(row);
          const open = openId === row.id;
          return (
            <AdminCard key={row.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{row.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.featured ? "Featured · " : ""}
                    {row.available ? "Available" : "Unavailable"}
                  </p>
                </div>
                <GhostButton
                  onClick={() => {
                    setDrafts((current) => ({ ...current, [row.id]: toDraft(row) }));
                    setOpenId(open ? null : row.id);
                  }}
                >
                  {open ? "Close" : "Edit"}
                </GhostButton>
              </div>
              {open ? (
                <div className="mt-5 border-t border-border pt-5">
                  <ItemForm
                    draft={draft}
                    setDraft={(next) => setDrafts((current) => ({ ...current, [row.id]: next }))}
                    categories={categories.data ?? []}
                    onSave={() => update.mutate({ id: row.id, draft })}
                    onDelete={() => remove.mutate(row.id)}
                    saving={update.isPending}
                    saveLabel="Save changes"
                  />
                </div>
              ) : null}
            </AdminCard>
          );
        })}
      </div>
    </div>
  );
}
