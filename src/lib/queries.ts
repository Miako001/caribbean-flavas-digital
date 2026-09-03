import { queryOptions } from "@tanstack/react-query";

import { getActiveOffers, getMenu, getSettings, getTestimonials } from "./content.functions";

export const menuQuery = () =>
  queryOptions({ queryKey: ["menu"], queryFn: () => getMenu(), staleTime: 30_000 });

export const offersQuery = () =>
  queryOptions({ queryKey: ["offers"], queryFn: () => getActiveOffers(), staleTime: 30_000 });

export const testimonialsQuery = () =>
  queryOptions({
    queryKey: ["testimonials"],
    queryFn: () => getTestimonials(),
    staleTime: 30_000,
  });

export const settingsQuery = () =>
  queryOptions({ queryKey: ["settings"], queryFn: () => getSettings(), staleTime: 60_000 });
