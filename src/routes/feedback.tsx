import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { Reveal } from "@/components/site/Reveal";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { submitFeedback } from "@/lib/content.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Tell Us What You Think | Zanzé Flavours" },
      {
        name: "description",
        content:
          "Share your Zanzé Flavours experience. Your feedback helps us make the flava even better.",
      },
      { property: "og:title", content: "Tell Us What You Think | Zanzé Flavours" },
      {
        property: "og:description",
        content: "Your feedback helps us make the flava even better.",
      },
    ],
  }),
  component: FeedbackPage,
});

const ENJOYED = ["Food", "Service", "Atmosphere", "Value", "Everything"] as const;
const RECOMMEND = ["Yes", "Maybe", "No"] as const;

const schema = z.object({
  name: z.string().trim().max(100, "Please keep your name under 100 characters.").optional(),
  email: z
    .string()
    .trim()
    .max(255, "Please keep your email under 255 characters.")
    .email("Please enter a valid email address.")
    .optional()
    .or(z.literal("")),
  rating: z.number().int().min(1).max(5).nullable(),
  message: z
    .string()
    .trim()
    .min(5, "Please tell us a little more — at least a few words.")
    .max(2000, "Please keep your feedback under 2000 characters."),
  enjoyed_most: z.string().optional(),
  would_recommend: z.enum(RECOMMEND).nullable(),
});

const inputClasses =
  "w-full rounded-2xl border border-input bg-card/60 px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring";

function FeedbackPage() {
  const [rating, setRating] = useState<number | null>(null);
  const [enjoyed, setEnjoyed] = useState("");
  const [recommend, setRecommend] = useState<(typeof RECOMMEND)[number] | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof schema>) => submitFeedback({ data: values }),
    onSuccess: () => setDone(true),
  });

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = schema.safeParse({
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      rating,
      message: String(form.get("message") ?? ""),
      enjoyed_most: enjoyed,
      would_recommend: recommend,
    });

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});
    mutation.mutate(parsed.data);
  }

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Feedback"
        title="Tell Us What You Think"
        subtitle="Your feedback helps us make the flava even better."
      />

      <div className="mx-auto max-w-2xl px-4 pb-24 sm:px-6 lg:px-8">
        {done ? (
          <Reveal>
            <div className="surface-card rounded-3xl p-8 text-center">
              <h2 className="font-display text-3xl font-bold">Thanks for sharing the flava! 🌴</h2>
              <p className="mt-3 text-muted-foreground">Your feedback has been received.</p>
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <form onSubmit={onSubmit} noValidate className="surface-card rounded-3xl p-6 sm:p-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold">
                    Name <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <input id="name" name="name" type="text" maxLength={100} className={cn(inputClasses, "mt-2")} />
                  {errors["name"] ? (
                    <p className="mt-2 text-sm text-destructive">{errors["name"]}</p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold">
                    Email <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    maxLength={255}
                    className={cn(inputClasses, "mt-2")}
                  />
                  {errors["email"] ? (
                    <p className="mt-2 text-sm text-destructive">{errors["email"]}</p>
                  ) : null}
                </div>

                <fieldset>
                  <legend className="text-sm font-semibold">Rating</legend>
                  <div className="mt-2 flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        aria-label={`${value} star${value > 1 ? "s" : ""}`}
                        aria-pressed={rating === value}
                        className="rounded-xl p-1.5 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <Star
                          width={30}
                          height={30}
                          className={cn(
                            rating !== null && value <= rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground/50",
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold">
                    What did you think?
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    maxLength={2000}
                    required
                    className={cn(inputClasses, "mt-2 resize-y")}
                  />
                  {errors["message"] ? (
                    <p className="mt-2 text-sm text-destructive">{errors["message"]}</p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="enjoyed" className="block text-sm font-semibold">
                    What did you enjoy most?
                  </label>
                  <select
                    id="enjoyed"
                    value={enjoyed}
                    onChange={(event) => setEnjoyed(event.target.value)}
                    className={cn(inputClasses, "mt-2")}
                  >
                    <option value="">Select an option</option>
                    {ENJOYED.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <fieldset>
                  <legend className="text-sm font-semibold">Would you recommend us?</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {RECOMMEND.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setRecommend(option)}
                        aria-pressed={recommend === option}
                        className={cn(
                          "rounded-full px-6 py-3 text-sm font-semibold transition-colors",
                          recommend === option
                            ? "bg-accent text-accent-foreground"
                            : "border border-border text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </fieldset>

                {mutation.isError ? (
                  <p className="text-sm text-destructive">
                    Something went wrong sending your feedback. Please try again.
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-gold transition-transform hover:scale-[1.01] disabled:opacity-60"
                >
                  {mutation.isPending ? "Sending…" : "Send Feedback"}
                </button>
              </div>
            </form>
          </Reveal>
        )}
      </div>
    </SiteLayout>
  );
}
