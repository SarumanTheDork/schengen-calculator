const ENV_BASE_DEFAULT =
  process.env.VERCEL_ENV === "production" ? "/tools/schengen-calculator" : "";

export const TOOL_BASE = process.env.NEXT_PUBLIC_TOOL_BASE_PATH || ENV_BASE_DEFAULT;

export function withToolBase(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!TOOL_BASE) return normalizedPath;
  if (normalizedPath === "/") return TOOL_BASE;
  return `${TOOL_BASE}${normalizedPath}`;
}
