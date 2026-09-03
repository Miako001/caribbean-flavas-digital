import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AdminCard, GhostButton } from "./ui";
import { StarRating } from "@/components/site/StarRating";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string;
  name: string | null;
  email: string | null;
  rating: number | null;
  message: string;
  enjoyed_most: string | null;
  would_recommend: string | null;
  created_at: string;
};

export function FeedbackList() {
  const queryClient = useQueryClient();

  const feedback = useQuery({
    queryKey: ["admin", "feedback"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as Row[];
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("feedback").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "feedback"] });
      toast.success("Feedback deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if ((feedback.data ?? []).length === 0) {
    return <p className="text-sm text-muted-foreground">No customer feedback yet.</p>;
  }

  return (
    <div className="space-y-3">
      {(feedback.data ?? []).map((row) => (
        <AdminCard key={row.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {row.name || "Anonymous"}
                {row.email ? (
                  <span className="ml-2 text-xs text-muted-foreground">{row.email}</span>
                ) : null}
              </p>
              {row.rating ? <StarRating rating={row.rating} className="mt-1" /> : null}
              <p className="mt-2 text-sm text-muted-foreground">{row.message}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {row.enjoyed_most ? `Enjoyed most: ${row.enjoyed_most} · ` : ""}
                {row.would_recommend ? `Recommends: ${row.would_recommend} · ` : ""}
                {new Date(row.created_at).toLocaleString()}
              </p>
            </div>
            <GhostButton tone="danger" onClick={() => remove.mutate(row.id)}>
              Delete
            </GhostButton>
          </div>
        </AdminCard>
      ))}
    </div>
  );
}
