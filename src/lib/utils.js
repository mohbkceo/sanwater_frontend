import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatPrice(value) {
  const num = Number(value || 0);
  return new Intl.NumberFormat("fr-FR").format(num);
}