import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for merging tailwind classes with ease.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Security utility to mask sensitive strings.
 */
export function maskToken(token: string | undefined): string {
  if (!token) return "";
  if (token.length <= 8) return "********";
  return `${token.slice(0, 4)}••••••••${token.slice(-4)}`;
}

/**
 * Validates if the string is a PEM private key.
 */
export function isValidPem(pem: string): boolean {
  return pem.includes("-----BEGIN RSA PRIVATE KEY-----") && pem.includes("-----END RSA PRIVATE KEY-----");
}
