export function formatPrice(price: number | string | null | undefined): string | null {
  if (price === null || price === undefined || price === "") return null;
  const value = typeof price === "string" ? Number(price) : price;
  if (Number.isNaN(value)) return null;
  return `KSH ${value.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}

export function digitsOnly(value: string | undefined): string {
  return (value ?? "").replace(/[^\d+]/g, "");
}
