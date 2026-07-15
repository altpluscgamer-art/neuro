import prisma from "@/lib/prisma";
import { Users, Search, Shield } from "lucide-react";
import UsersClient from "./UsersClient";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";

  const where = q
    ? {
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
        ],
      }
    : {};

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { bookings: true } },
    },
  });

  const serialized = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    createdAt: u.createdAt.toISOString(),
    bookingCount: u._count.bookings,
  }));

  return <UsersClient users={serialized} defaultQuery={q} />;
}
