import { db } from "@/shared/lib/db/prisma";
import type { ListAdminOrganizationsQuery } from "../organizations.types";

export async function listAdminOrganizations(
  query: ListAdminOrganizationsQuery,
) {
  const limit = query.limit ?? 20;
  const offset = query.offset ?? 0;
  const search = query.search?.trim() || undefined;

  const where = search
    ? { name: { contains: search, mode: "insensitive" as const } }
    : {};

  const [organizations, total] = await Promise.all([
    db.organization.findMany({
      where,
      include: {
        members: {
          include: {
            user: { select: { email: true, name: true, image: true } },
          },
        },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    db.organization.count({ where }),
  ]);

  return { organizations, total };
}
