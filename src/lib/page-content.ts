import { getAllSettings } from "./settings";

export async function getPageContent(): Promise<Record<string, string>> {
  const all = await getAllSettings();
  const pageContent: Record<string, string> = {};
  for (const [key, value] of Object.entries(all)) {
    if (key.startsWith("page_") || key.startsWith("site_") || key.startsWith("social_")) {
      pageContent[key] = value;
    }
  }
  return pageContent;
}

export function getOr(content: Record<string, string>, key: string, fallback: string): string {
  const val = content[key];
  if (val && val.trim()) return val;
  return fallback;
}
