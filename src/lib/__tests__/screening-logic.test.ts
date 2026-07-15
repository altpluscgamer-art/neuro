import { describe, it, expect } from "vitest";
import { generateReport } from "@/lib/screening-logic";

describe("generateReport", () => {
  const validStrengths = ["любит рисовать", "любит конструировать"];
  const validConcerns = ["плохо концентрируется", "трудно сидеть на месте"];
  const validFrequencies = {
    "плохо концентрируется": "часто" as const,
    "трудно сидеть на месте": "иногда" as const,
  };

  it("returns a valid report structure", () => {
    const report = generateReport("5-7", validConcerns, validFrequencies, validStrengths);

    expect(report).toBeDefined();
    expect(report).toHaveProperty("neuropsychProfile");
    expect(report).toHaveProperty("strengthsSection");
    expect(report).toHaveProperty("syndromes");
    expect(report).toHaveProperty("concernsSection");
    expect(report).toHaveProperty("homeActivitiesSection");
    expect(report).toHaveProperty("materialsSection");
    expect(report).toHaveProperty("specialistRecommendation");
  });

  it("report includes strengthsSection, concernsSection, homeActivitiesSection, materialsSection, specialistRecommendation", () => {
    const report = generateReport("5-7", validConcerns, validFrequencies, validStrengths);

    expect(report.strengthsSection).toHaveProperty("title");
    expect(report.strengthsSection).toHaveProperty("intro");
    expect(report.strengthsSection).toHaveProperty("items");
    expect(Array.isArray(report.strengthsSection.items)).toBe(true);

    expect(report.concernsSection).toHaveProperty("title");
    expect(report.concernsSection).toHaveProperty("intro");
    expect(report.concernsSection).toHaveProperty("areas");
    expect(Array.isArray(report.concernsSection.areas)).toBe(true);

    expect(report.homeActivitiesSection).toHaveProperty("title");
    expect(report.homeActivitiesSection).toHaveProperty("intro");
    expect(report.homeActivitiesSection).toHaveProperty("activities");
    expect(Array.isArray(report.homeActivitiesSection.activities)).toBe(true);

    expect(report.materialsSection).toHaveProperty("title");
    expect(report.materialsSection).toHaveProperty("links");
    expect(Array.isArray(report.materialsSection.links)).toBe(true);

    expect(report.specialistRecommendation).toHaveProperty("show");
    expect(typeof report.specialistRecommendation.show).toBe("boolean");
    expect(report.specialistRecommendation).toHaveProperty("title");
    expect(report.specialistRecommendation).toHaveProperty("text");
    expect(report.specialistRecommendation).toHaveProperty("urgency");
  });

  it("returns valid data with no concerns", () => {
    const report = generateReport("5-7", [], {}, validStrengths);

    expect(report).toBeDefined();
    expect(report.neuropsychProfile.profile.block1.score).toBe(0);
    expect(report.neuropsychProfile.profile.block2.score).toBe(0);
    expect(report.neuropsychProfile.profile.block3.score).toBe(0);
    expect(report.syndromes.syndromes).toHaveLength(0);
    expect(report.concernsSection.areas).toHaveLength(0);
    expect(report.specialistRecommendation.show).toBe(false);
    expect(report.homeActivitiesSection.activities.length).toBeGreaterThan(0);
  });

  it("triggers specialist recommendation with many concerns", () => {
    const manyConcerns = [
      "плохо концентрируется",
      "трудно сидеть на месте",
      "тревожится",
      "быстро устаёт",
      "плохо читает",
    ];
    const frequencies = {
      "плохо концентрируется": "часто" as const,
      "трудно сидеть на месте": "часто" as const,
      "тревожится": "часто" as const,
      "быстро устаёт": "часто" as const,
      "плохо читает": "часто" as const,
    };

    const report = generateReport("7-10", manyConcerns, frequencies, validStrengths);

    expect(report.specialistRecommendation.show).toBe(true);
    expect(report.specialistRecommendation.title).not.toBe("");
    expect(report.specialistRecommendation.text).not.toBe("");
  });

  it("NeuropsychProfile has 3 blocks with score/maxScore", () => {
    const report = generateReport("5-7", validConcerns, validFrequencies, validStrengths);
    const { profile } = report.neuropsychProfile;

    expect(profile).toHaveProperty("block1");
    expect(profile).toHaveProperty("block2");
    expect(profile).toHaveProperty("block3");

    for (const block of [profile.block1, profile.block2, profile.block3]) {
      expect(block).toHaveProperty("label");
      expect(typeof block.label).toBe("string");
      expect(block).toHaveProperty("score");
      expect(typeof block.score).toBe("number");
      expect(block).toHaveProperty("maxScore");
      expect(typeof block.maxScore).toBe("number");
      expect(block).toHaveProperty("status");
      expect(typeof block.status).toBe("string");
      expect(block.score).toBeGreaterThanOrEqual(0);
      expect(block.maxScore).toBeGreaterThan(0);
      expect(block.score).toBeLessThanOrEqual(block.maxScore);
    }
  });

  it("detects syndromes for known symptom clusters", () => {
    // Energy deficit syndrome (block 1): "быстро устаёт" + "плохо засыпает"
    const energyReport = generateReport(
      "5-7",
      ["быстро устаёт", "плохо засыпает"],
      { "быстро устаёт": "часто" as const, "плохо засыпает": "часто" as const },
      validStrengths,
    );
    expect(energyReport.syndromes.syndromes.length).toBeGreaterThan(0);
    expect(
      energyReport.syndromes.syndromes.some((s) => s.name.includes("энергодефицит")),
    ).toBe(true);

    // Visuospatial difficulties (block 2): "плохо пишет" + "плохо читает"
    const visuoReport = generateReport(
      "7-10",
      ["плохо пишет", "плохо читает"],
      { "плохо пишет": "часто" as const, "плохо читает": "часто" as const },
      validStrengths,
    );
    expect(
      visuoReport.syndromes.syndromes.some((s) => s.name.includes("зрительно-пространствен")),
    ).toBe(true);

    // Emotional dysregulation (block 3): "тревожится" + "истерики" + "агрессия"
    const emotionReport = generateReport(
      "5-7",
      ["тревожится", "истерики", "агрессия"],
      {
        "тревожится": "часто" as const,
        "истерики": "часто" as const,
        "агрессия": "часто" as const,
      },
      validStrengths,
    );
    expect(
      emotionReport.syndromes.syndromes.some((s) => s.name.includes("эмоциональной дисрегуляц")),
    ).toBe(true);
  });

  it("returns age-appropriate activities", () => {
    // Age 5-7 with concern "плохо концентрируется"
    const report57 = generateReport(
      "5-7",
      ["плохо концентрируется"],
      { "плохо концентрируется": "часто" as const },
      validStrengths,
    );
    expect(report57.homeActivitiesSection.activities.length).toBeGreaterThan(0);
    expect(
      report57.homeActivitiesSection.activities.some((a) => a.title === "Графические диктанты"),
    ).toBe(true);

    // Age 1-2 with concern "плохо засыпает"
    const report12 = generateReport(
      "1-2",
      ["плохо засыпает"],
      { "плохо засыпает": "часто" as const },
      validStrengths,
    );
    expect(report12.homeActivitiesSection.activities.length).toBeGreaterThan(0);
    expect(
      report12.homeActivitiesSection.activities.some(
        (a) => a.title === "Вечерний ритуал: ванна, книга, колыбельная",
      ),
    ).toBe(true);

    // Age 10-13 with concern "не запоминает"
    const report1013 = generateReport(
      "10-13",
      ["не запоминает"],
      { "не запоминает": "часто" as const },
      validStrengths,
    );
    expect(report1013.homeActivitiesSection.activities.length).toBeGreaterThan(0);
    expect(
      report1013.homeActivitiesSection.activities.some(
        (a) => a.title === "Мнемотехника и «дворец памяти»",
      ),
    ).toBe(true);
  });
});
