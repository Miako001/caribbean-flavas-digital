import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { AdminCard, Field, GhostButton, PrimaryButton, Toggle, adminInput } from "./ui";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  active: boolean;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CategoriesManager() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const categories = useQuery({
    queryKey: ["admin", "menu_categories_full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_categories")
        .select("id, name, slug, description, display_order, active")
        .order("display_order");
      if (error) throw new Error(error.message);
      return (data ?? []) as Row[];
    },
  });

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ["admin", "menu_categories_full"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "menu_categories"] });
    void queryClient.invalidateQueries({ queryKey: ["menu"] });
  }

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("menu_categories").insert({
        name: name.trim(),
        slug: slugify(name) || crypto.randomUUID().slice(0, 8),
        description: description.trim() || null,
        display_order: (categories.data?.length ?? 0) + 1,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setName("");
      setDescription("");
      invalidate();
      toast.success("Category added");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<Row> }) => {
      const { error } = await supabase.from("menu_categories").update(values).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Category updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_categories").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Category deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <AdminCard>
        <h3 className="font-display text-lg font-bold">Add a category</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input value={name} onChange={(e) => setName(e.target.value)} className={adminInput} />
          </Field>
          <Field label="Description">
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={adminInput}
            />
          </Field>
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => create.mutate()} disabled={!name.trim() || create.isPending}>
            Add category
          </PrimaryButton>
        </div>
      </AdminCard>

      <div className="space-y-3">
        {(categories.data ?? []).map((row) => (
          <AdminCard key={row.id}>
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_120px]">
              <Field label="Name">
                <input
                  defaultValue={row.name}
                  onBlur={(event) =>
                    event.target.value !== row.name &&
                    update.mutate({ id: row.id, values: { name: event.target.value } })
                  }
                  className={adminInput}
                />
              </Field>
              <Field label="Description">
                <input
                  defaultValue={row.description ?? ""}
                  onBlur={(event) =>
                    update.mutate({ id: row.id, values: { description: event.target.value || null } })
                  }
                  className={adminInput}
                />
              </Field>
              <Field label="Order">
                <input
                  type="number"
                  defaultValue={row.display_order}
                  onBlur={(event) =>
                    update.mutate({
                      id: row.id,
                      values: { display_order: Number(event.target.value) || 0 },
                    })
                  }
                  className={adminInput}
                />
              </Field>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Toggle
                label={row.active ? "Active" : "Hidden"}
                checked={row.active}
                onChange={(value) => update.mutate({ id: row.id, values: { active: value } })}
              />
              <GhostButton tone="danger" onClick={() => remove.mutate(row.id)}>
                Delete
              </GhostButton>
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
