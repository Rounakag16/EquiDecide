const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? "";

const normalizedBaseUrl = rawBaseUrl.endsWith("/")
  ? rawBaseUrl.slice(0, -1)
  : rawBaseUrl;

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!normalizedBaseUrl) return normalizedPath;
  return `${normalizedBaseUrl}${normalizedPath}`;
}
