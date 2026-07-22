import prisma from "@/lib/prisma";
import { FileText, ChevronDown, ChevronUp, Filter } from "lucide-react";
import ScreeningResultsClient from "./ScreeningResultsClient";

export default async function ScreeningResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;

  const where: Record<string, unknown> = {};
  if (params.from || params.to) {
    const createdAt: Record<string, Date> = {};
    if (params.from) createdAt.gte = new Date(params.from);
    if (params.to) createdAt.lte = new Date(params.to + "T23:59:59");
    where.createdAt = createdAt;
  }

  const results = await prisma.screeningResult.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { name: true, email: true } } },
  });

  return <ScreeningResultsClient results={results} defaultFrom={params.from ?? ""} defaultTo={params.to ?? ""} />;
}
