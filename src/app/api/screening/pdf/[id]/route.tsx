import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { ScreeningReport } from "@/lib/screening-logic";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4AMP6lQ.woff2",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    padding: 40,
    lineHeight: 1.6,
    color: "#1f2937",
  },
  header: {
    fontSize: 18,
    fontWeight: 700,
    color: "#4338ca",
    marginBottom: 2,
  },
  headerDate: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#c7d2fe",
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#312e81",
    marginTop: 10,
    marginBottom: 4,
  },
  sectionIntro: {
    fontSize: 9,
    color: "#4b5563",
    marginBottom: 8,
  },
  blockTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#3730a3",
    marginBottom: 4,
    marginTop: 6,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  scoreLabel: {
    width: "55%",
    fontSize: 9,
    color: "#374151",
  },
  scoreBarBg: {
    width: "35%",
    height: 7,
    borderRadius: 4,
    backgroundColor: "#e0e7ff",
    overflow: "hidden",
  },
  scoreBarFill: {
    height: 7,
    borderRadius: 4,
  },
  scoreValue: {
    width: "10%",
    fontSize: 8,
    color: "#6b7280",
    textAlign: "right",
  },
  itemTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 1,
  },
  itemDesc: {
    fontSize: 9,
    color: "#4b5563",
    marginBottom: 6,
  },
  syndromeItem: {
    backgroundColor: "#fef3c7",
    borderRadius: 4,
    padding: 6,
    marginBottom: 4,
  },
  syndromeTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: "#92400e",
    marginBottom: 1,
  },
  syndromeDesc: {
    fontSize: 9,
    color: "#78350f",
  },
  recBox: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    marginBottom: 4,
  },
  recNormal: {
    backgroundColor: "#eff6ff",
    borderColor: "#93c5fd",
  },
  recHigh: {
    backgroundColor: "#fef2f2",
    borderColor: "#fca5a5",
  },
  recTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 2,
  },
  recText: {
    fontSize: 9,
    color: "#374151",
  },
  materialLink: {
    fontSize: 9,
    color: "#4338ca",
    marginBottom: 2,
  },
  materialDesc: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 4,
  },
  footer: {
    fontSize: 8,
    color: "#9ca3af",
    marginTop: 24,
    textAlign: "center",
  },
});

const COGNITIVE_KEYS = [
  "плохо концентрируется",
  "не запоминает",
  "плохо читает",
  "плохо пишет",
];
const EMOTIONAL_KEYS = [
  "тревожится",
  "истерики",
  "агрессия",
  "плохо засыпает",
];
const BEHAVIORAL_KEYS = [
  "трудно сидеть на месте",
  "быстро устаёт",
  "не хочет идти в школу",
  "есть сложности с речью",
];

function scoreFor(
  concern: string,
  concerns: string[],
  frequencies: Record<string, string>
): number {
  if (!concerns.includes(concern)) return 8;
  const freq = frequencies[concern];
  if (freq === "часто") return 80;
  if (freq === "иногда") return 55;
  if (freq === "редко") return 30;
  return 55;
}

function scoreColor(score: number): string {
  if (score >= 70) return "#ef4444";
  if (score >= 40) return "#f59e0b";
  return "#22c55e";
}

function detectSyndromes(
  concerns: string[]
): { title: string; description: string }[] {
  const has = (c: string) => concerns.includes(c);
  const syndromes: { title: string; description: string }[] = [];

  if (
    has("трудно сидеть на месте") &&
    has("плохо концентрируется") &&
    has("быстро устаёт")
  ) {
    syndromes.push({
      title: "Синдром дефицита внимания и гиперактивности (СДВГ)",
      description:
        "Сочетание гиперактивности, невнимательности и утомляемости может указывать на СДВГ. Рекомендуется углублённая диагностика у специалиста.",
    });
  }

  if (has("плохо читает") && has("плохо пишет")) {
    syndromes.push({
      title: "Риск специфических расстройств обучения",
      description:
        "Сочетание трудностей с чтением и письмом может указывать на дислексию и/или дисграфию. Необходима диагностика у нейропсихолога или логопеда.",
    });
  }

  if (has("тревожится") && has("плохо засыпает") && has("истерики")) {
    syndromes.push({
      title: "Тревожно-астенический кластер",
      description:
        "Сочетание тревожности, проблем со сном и истерик может говорить о высокой нагрузке на нервную систему и эмоциональном истощении.",
    });
  }

  if (has("агрессия") && has("истерики")) {
    syndromes.push({
      title: "Кластер эмоциональной дисрегуляции",
      description:
        "Сочетание агрессии и истерик указывает на незрелость механизмов эмоциональной регуляции. Рекомендуется работа с нейропсихологом.",
    });
  }

  if (has("есть сложности с речью") && concerns.length >= 2) {
    syndromes.push({
      title: "Риск речевых нарушений",
      description:
        "Речевые трудности в сочетании с другими проблемами могут влиять на обучение и социализацию. Рекомендуется консультация логопеда.",
    });
  }

  return syndromes;
}

const BLOCK_LABELS: Record<string, string> = {
  "плохо концентрируется": "Внимание и концентрация",
  "не запоминает": "Память",
  "плохо читает": "Навыки чтения",
  "плохо пишет": "Письменные навыки",
  "тревожится": "Тревожность",
  "истерики": "Эмоциональные срывы",
  "агрессия": "Агрессия",
  "плохо засыпает": "Сон и режим",
  "трудно сидеть на месте": "Саморегуляция",
  "быстро устаёт": "Работоспособность",
  "не хочет идти в школу": "Школьная адаптация",
  "есть сложности с речью": "Речевое развитие",
};

function ProfileBlock({
  title,
  keys,
  concerns,
  frequencies,
}: {
  title: string;
  keys: string[];
  concerns: string[];
  frequencies: Record<string, string>;
}) {
  return (
    <View>
      <Text style={styles.blockTitle}>{title}</Text>
      {keys.map((key) => {
        const sc = scoreFor(key, concerns, frequencies);
        const pct = `${sc}%`;
        return (
          <View key={key} style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>{BLOCK_LABELS[key] ?? key}</Text>
            <View style={styles.scoreBarBg}>
              <View
                style={[
                  styles.scoreBarFill,
                  { width: pct, backgroundColor: scoreColor(sc) },
                ]}
              />
            </View>
            <Text style={styles.scoreValue}>{sc}</Text>
          </View>
        );
      })}
    </View>
  );
}

function ScreeningPdfDocument({
  report,
  concerns,
  frequencies,
  createdAt,
}: {
  report: ScreeningReport;
  concerns: string[];
  frequencies: Record<string, string>;
  createdAt: string;
}) {
  const syndromes = detectSyndromes(concerns);
  const dateStr = new Date(createdAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Нейро — Персональный отчёт</Text>
        <Text style={styles.headerDate}>{dateStr}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Нейропсихологический профиль</Text>
        <ProfileBlock
          title="Когнитивные функции"
          keys={COGNITIVE_KEYS}
          concerns={concerns}
          frequencies={frequencies}
        />
        <ProfileBlock
          title="Эмоциональная сфера"
          keys={EMOTIONAL_KEYS}
          concerns={concerns}
          frequencies={frequencies}
        />
        <ProfileBlock
          title="Поведение и адаптация"
          keys={BEHAVIORAL_KEYS}
          concerns={concerns}
          frequencies={frequencies}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>
          {report.strengthsSection.title}
        </Text>
        <Text style={styles.sectionIntro}>
          {report.strengthsSection.intro}
        </Text>
        {report.strengthsSection.items.map((item) => (
          <View key={item.label}>
            <Text style={styles.itemTitle}>{item.label}</Text>
            <Text style={styles.itemDesc}>{item.description}</Text>
          </View>
        ))}

        {syndromes.length > 0 && (
          <View>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Выявленные синдромы</Text>
            {syndromes.map((s) => (
              <View key={s.title} style={styles.syndromeItem}>
                <Text style={styles.syndromeTitle}>{s.title}</Text>
                <Text style={styles.syndromeDesc}>{s.description}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>
          {report.concernsSection.title}
        </Text>
        <Text style={styles.sectionIntro}>
          {report.concernsSection.intro}
        </Text>
        {report.concernsSection.areas.map((area) => (
          <View key={area.concern}>
            <Text style={styles.itemTitle}>
              {area.area} ({area.concern})
            </Text>
            <Text style={styles.itemDesc}>{area.description}</Text>
          </View>
        ))}
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>
          {report.homeActivitiesSection.title}
        </Text>
        <Text style={styles.sectionIntro}>
          {report.homeActivitiesSection.intro}
        </Text>
        {report.homeActivitiesSection.activities.map((a, i) => (
          <View key={i}>
            <Text style={styles.itemTitle}>{a.title}</Text>
            <Text style={styles.itemDesc}>{a.description}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>
          {report.materialsSection.title}
        </Text>
        {report.materialsSection.links.map((link) => (
          <View key={link.href}>
            <Text style={styles.materialLink}>{link.title}</Text>
            <Text style={styles.materialDesc}>{link.description}</Text>
          </View>
        ))}

        {report.specialistRecommendation.show && (
          <View>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>
              {report.specialistRecommendation.title}
            </Text>
            <View
              style={[
                styles.recBox,
                report.specialistRecommendation.urgency === "high"
                  ? styles.recHigh
                  : styles.recNormal,
              ]}
            >
              <Text
                style={[
                  styles.recTitle,
                  report.specialistRecommendation.urgency === "high"
                    ? { color: "#dc2626" }
                    : { color: "#1d4ed8" },
                ]}
              >
                {report.specialistRecommendation.urgency === "high"
                  ? "Повышенная срочность"
                  : "Рекомендуется консультация"}
              </Text>
              <Text style={styles.recText}>
                {report.specialistRecommendation.text}
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.footer}>
          Сгенерировано на платформе Нейро | Это не медицинский диагноз
        </Text>
      </Page>
    </Document>
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await prisma.screeningResult.findUnique({ where: { id } });
    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const report: ScreeningReport = JSON.parse(result.report);
    const concerns: string[] = JSON.parse(result.concerns);
    const frequencies: Record<string, string> = result.concernFrequencies
      ? JSON.parse(result.concernFrequencies)
      : {};

    const buffer = await renderToBuffer(
      <ScreeningPdfDocument
        report={report}
        concerns={concerns}
        frequencies={frequencies}
        createdAt={result.createdAt.toISOString()}
      />
    );

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="neuro-report.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
