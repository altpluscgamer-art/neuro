import prisma from "@/lib/prisma";
import { MessageSquare, Phone, Mail, Check, Clock } from "lucide-react";
import ConsultationRequestsClient from "./ConsultationRequestsClient";

export default async function ConsultationRequestsPage() {
  const requests = await prisma.consultationRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  const serialized = requests.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return <ConsultationRequestsClient requests={serialized} />;
}
