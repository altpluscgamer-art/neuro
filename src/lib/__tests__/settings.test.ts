import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("react", () => ({
  cache: <T>(fn: T): T => fn,
}));

const settingMocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  findMany: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    setting: {
      findUnique: settingMocks.findUnique,
      findMany: settingMocks.findMany,
      upsert: settingMocks.upsert,
    },
  },
}));

import { getSetting, getAllSettings } from "@/lib/settings";

describe("settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getSetting returns value from DB", async () => {
    settingMocks.findUnique.mockResolvedValue({
      key: "telegram_bot_token",
      value: "123456:ABC-DEF",
    });

    const result = await getSetting("telegram_bot_token");
    expect(result).toBe("123456:ABC-DEF");
    expect(settingMocks.findUnique).toHaveBeenCalledWith({
      where: { key: "telegram_bot_token" },
    });
  });

  it("getSetting returns null for missing key", async () => {
    settingMocks.findUnique.mockResolvedValue(null);

    const result = await getSetting("nonexistent_key");
    expect(result).toBeNull();
    expect(settingMocks.findUnique).toHaveBeenCalledWith({
      where: { key: "nonexistent_key" },
    });
  });

  it("getAllSettings returns all settings as key-value object", async () => {
    settingMocks.findMany.mockResolvedValue([
      { key: "smtp_host", value: "smtp.yandex.ru" },
      { key: "smtp_port", value: "587" },
      { key: "telegram_bot_token", value: "123456:ABC" },
    ]);

    const result = await getAllSettings();
    expect(result).toEqual({
      smtp_host: "smtp.yandex.ru",
      smtp_port: "587",
      telegram_bot_token: "123456:ABC",
    });
    expect(settingMocks.findMany).toHaveBeenCalledOnce();
  });
});
