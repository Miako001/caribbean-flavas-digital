import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { ImageField } from "./ImageField";
import { AdminCard, Field, GhostButton, PrimaryButton, Toggle, adminInput } from "./ui";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: number | string | null;
  discount: string | null;
  start_date: string | null;
  end_date: string | null;
  active: boolean;
  terms: string | null;
  display_order: number;
};

type Draft = {
  title: string;
  description: string;
  image_url: string;
  price: string;
  discount: string;
  start_date: string;
  end_date: string;
  active: boolean;
  terms: string;
  display_order: string;
};

const emptyDraft: Draft = {
  title: "",
  description: "",
  image_url: "",
  price: "",
  discount: "",
  start_date: "",
  end_date: "",
  active: true,
  terms: "",
  display_order: "0",
};

function toDraft(row: Row): Draft {
  return {
    title: row.title,
    description: row.description ?? "",
    image_url: row.image_url ?? "",
    price: row.price === null ? "" : String(row.price),
    discount: row.discount ?? "",
    start_date: row.start_date ?? "",
    end_date: row.end_date ?? "",
    active: row.active,
    terms: row.terms ?? "",
    display_order: String(row.display_order),
  };
}

function toPayload(draft: Draft) {
  return {
    title: draft.title.trim(),
    description: draft.description.trim() || null,
    image_url: draft.image_url.trim() || null,
    price: draft.price.trim() === "" ? null : Number(draft.price),
    discount: draft.discount.trim() || null,
    start_date: draft.start_date || null,
    end_date: draft.end_date || null,
    active: draft.active,
    terms: draft.terms.trim() || null,
    display_order: Number(draft.display_order) || 0,
  };
}

function OfferForm({
  draft,
  setDraft,
  onSave,
  onDelete,
  saving,
  saveLabel,
}: {
  draft: Draft;
  setDraft: (draft: Draft) => void;
  onSave: () => void;
  onDelete?: () => void;
  saving: boolean;
  saveLabel: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title">
          <input
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            className={adminInput}
          />
        </Field>
        <Field label="Discount label">
          <input
            value={draft.discount}
            onChange={(event) => setDraft({ ...draft, discount: event.target.value })}
            placeholder="Save 15%"
            className={adminInput}
          />
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

      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Price">
          <input
            type="number"
            step="0.01"
            value={draft.price}
            onChange={(event) => setDraft({ ...draft, price: event.target.value })}
            className={adminInput}
          />
        </Field>
        <Field label="Start date">
          <input
            type="date"
            value={draft.start_date}
            onChange={(event) => setDraft({ ...draft, start_date: event.target.value })}
            className={adminInput}
          />
        </Field>
        <Field label="End date">
          <input
            type="date"
            value={draft.end_date}
            onChange={(event) => setDraft({ ...draft, end_date: event.target.value })}
            className={adminInput}
          />
        </Field>
        <Field label="Order">
          <input
            type="number"
            value={draft.display_order}
            onChange={(event) => setDraft({ ...draft, display_order: event.target.value })}
            className={adminInput}
          />
        </Field>
      </div>

      <Field label="Terms">
        <input
          value={draft.terms}
          onChange={(event) => setDraft({ ...draft, terms: event.target.value })}
          className={adminInput}
        />
      </Field>

      <ImageField
        value={draft.image_url}
        folder="offers"
        onChange={(url) => setDraft({ ...draft, image_url: url })}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Toggle
          label={draft.active ? "Active" : "Inactive"}
          checked={draft.active}
          onChange={(value) => setDraft({ ...draft, active: value })}
        />
        <PrimaryButton onClick={onSave} disabled={saving || !draft.title.trim()}>
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

export function OffersManager() {
  const queryClient = useQueryClient();
  const [newDraft, setNewDraft] = useState<Draft>(emptyDraft);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  const offers = useQuery({
    queryKey: ["admin", "offers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("offers").select("*").order("display_order");
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as Row[];
    },
  });

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ["admin", "offers"] });
    void queryClient.invalidateQueries({ queryKey: ["offers"] });
  }

  const create = useMutation({
    mutationFn: async (draft: Draft) => {
      const { error } = await supabase.from("offers").insert(toPayload(draft));
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setNewDraft(emptyDraft);
      invalidate();
      toast.success("Offer added");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, draft }: { id: string; draft: Draft }) => {
      const { error } = await supabase.from("offers").update(toPayload(draft)).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Offer updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("offers").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Offer deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <AdminCard>
        <h3 className="font-display text-lg font-bold">Add an offer</h3>
        <div className="mt-4">
          <OfferForm
            draft={newDraft}
            setDraft={setNewDraft}
            onSave={() => create.mutate(newDraft)}
            saving={create.isPending}
            saveLabel="Add offer"
          />
        </div>
      </AdminCard>

      <div className="space-y-3">
        {(offers.data ?? []).map((row) => {
          const draft = drafts[row.id] ?? toDraft(row);
          const open = openId === row.id;
          return (
            <AdminCard key={row.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{row.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.active ? "Active" : "Inactive"}
                    {row.end_date ? ` · ends ${row.end_date}` : ""}
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
                  <OfferForm
                    draft={draft}
                    setDraft={(next) => setDrafts((current) => ({ ...current, [row.id]: next }))}
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
