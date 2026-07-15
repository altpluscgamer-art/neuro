import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  hash: vi.fn(),
  userFindUnique: vi.fn(),
  userCreate: vi.fn(),
  userUpdate: vi.fn(),
  screeningResultCreate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findUnique: mocks.userFindUnique,
      create: mocks.userCreate,
      update: mocks.userUpdate,
    },
    screeningResult: {
      create: mocks.screeningResultCreate,
    },
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: mocks.getServerSession,
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: mocks.hash,
    compare: vi.fn(),
  },
}));

import { POST } from "@/app/api/screening/route";

describe("POST /api/screening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getServerSession.mockResolvedValue(null);
    mocks.userFindUnique.mockResolvedValue(null);
    mocks.userCreate.mockResolvedValue({ id: "user-1", email: "test@test.com" });
    mocks.screeningResultCreate.mockResolvedValue({ id: "result-1" });
    mocks.hash.mockResolvedValue("hashed_password");
  });

  function makeRequest(body: Record<string, unknown>): Request {
    return new Request("http://localhost:3000/api/screening", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("returns 200 with report for valid data", async () => {
    const req = makeRequest({
      childAge: "5-7",
      concerns: ["плохо концентрируется"],
      concernFrequencies: { "плохо концентрируется": "часто" },
      strengths: ["любит рисовать"],
      parentName: "Test Parent",
      parentPhone: "+79990000000",
      parentEmail: "test@test.com",
      messenger: "telegram",
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.id).toBe("result-1");
    expect(data.report).toBeDefined();
    expect(data.report.neuropsychProfile).toBeDefined();
    expect(data.report.strengthsSection).toBeDefined();
    expect(mocks.screeningResultCreate).toHaveBeenCalledOnce();
  });

  it("returns 400 when childAge is missing", async () => {
    const req = makeRequest({
      concerns: [],
      strengths: ["любит рисовать"],
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("childAge");
  });

  it("returns 400 when strengths is empty", async () => {
    const req = makeRequest({
      childAge: "5-7",
      concerns: [],
      strengths: [],
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("strength");
  });
});
