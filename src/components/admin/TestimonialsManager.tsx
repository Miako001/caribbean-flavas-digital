import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { AdminCard, Field, GhostButton, PrimaryButton, Toggle, adminInput } from "./ui";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string;
  customer_name: string;
  review: string;
  rating: number;
  review_date: string | null;
  approved: boolean;
  visible: boolean;
  is_sample: boolean;
  display_order: number;
};

export function TestimonialsManager() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState("5");
  const [date, setDate] = useState("");

  const testimonials = useQuery({
    queryKey: ["admin", "testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("display_order");
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as Row[];
    },
  });

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ["admin", "testimonials"] });
    void queryClient.invalidateQueries({ queryKey: ["testimonials"] });
  }

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("testimonials").insert({
        customer_name: name.trim(),
        review: review.trim(),
        rating: Math.min(5, Math.max(1, Number(rating) || 5)),
        review_date: date || null,
        approved: true,
        visible: true,
        is_sample: false,
        display_order: (testimonials.data?.length ?? 0) + 1,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setName("");
      setReview("");
      setDate("");
      invalidate();
      toast.success("Review added");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<Row> }) => {
      const { error } = await supabase.from("testimonials").update(values).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Review updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Review deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <AdminCard>
        <h3 className="font-display text-lg font-bold">Add a review</h3>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Customer name">
              <input value={name} onChange={(e) => setName(e.target.value)} className={adminInput} />
            </Field>
            <Field label="Rating (1-5)">
              <input
                type="number"
                min={1}
                max={5}
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className={adminInput}
              />
            </Field>
            <Field label="Date">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={adminInput}
              />
            </Field>
          </div>
          <Field label="Review">
            <textarea
              rows={3}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className={adminInput}
            />
          </Field>
          <PrimaryButton
            onClick={() => create.mutate()}
            disabled={!name.trim() || !review.trim() || create.isPending}
          >
            Add review
          </PrimaryButton>
        </div>
      </AdminCard>

      <div className="space-y-3">
        {(testimonials.data ?? []).map((row) => (
          <AdminCard key={row.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {row.customer_name}{" "}
                  <span className="text-xs text-muted-foreground">
                    {row.rating}★{row.is_sample ? " · sample" : ""}
                  </span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{row.review}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Toggle
                label={row.approved ? "Approved" : "Pending"}
                checked={row.approved}
                onChange={(value) => update.mutate({ id: row.id, values: { approved: value } })}
              />
              <Toggle
                label={row.visible ? "Visible" : "Hidden"}
                checked={row.visible}
                onChange={(value) => update.mutate({ id: row.id, values: { visible: value } })}
              />
              <Toggle
                label={row.is_sample ? "Sample" : "Real review"}
                checked={row.is_sample}
                onChange={(value) => update.mutate({ id: row.id, values: { is_sample: value } })}
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
