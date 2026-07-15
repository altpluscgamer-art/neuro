import { cache } from "react";
import prisma from "./prisma";

export const getSetting = cache(async (key: string): Promise<string | null> => {
  const setting = await prisma.setting.findUnique({ where: { key } });
  return setting?.value ?? null;
});

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export const getAllSettings = cache(async (): Promise<Record<string, string>> => {
  const settings = await prisma.setting.findMany();
  const result: Record<string, string> = {};
  for (const s of settings) {
    result[s.key] = s.value;
  }
  return result;
});

export async function getSettingsByPrefix(prefix: string): Promise<Record<string, string>> {
  const all = await getAllSettings();
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(all)) {
    if (k.startsWith(prefix)) {
      result[k] = v;
    }
  }
  return result;
}
