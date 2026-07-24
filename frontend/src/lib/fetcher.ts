/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/fetcher.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch<T = any>(
  path: string, 
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    // Attempt to extract backend error response JSON
    const errorBody = await res.json().catch(() => null);
    const message = errorBody?.message || errorBody?.error || `Request failed: ${res.status}`;
    throw new Error(message);
  }

  return res.json();
}