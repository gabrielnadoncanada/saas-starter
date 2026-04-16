import { NextResponse } from "next/server";

import {
  canViewUserAvatar,
  getUserAvatar,
} from "@/features/account/server/profile-image";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { rateLimit, rateLimitHeaders, resolveIdentity } from "@/lib/rate-limit";

export async function GET(
  _request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await rateLimit("public", await resolveIdentity());
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  const { userId } = await context.params;
  const canView = await canViewUserAvatar({
    viewerId: user.id,
    viewerRole: user.role,
    targetUserId: userId,
  });

  if (!canView) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const avatar = await getUserAvatar(userId);

  if (!avatar) {
    return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
  }

  const arrayBuffer = avatar.body.buffer.slice(
    avatar.body.byteOffset,
    avatar.body.byteOffset + avatar.body.byteLength,
  ) as ArrayBuffer;
  const blob = new Blob([arrayBuffer], { type: avatar.contentType });

  return new NextResponse(blob, {
    headers: {
      "Cache-Control": "private, max-age=0, must-revalidate",
      "Content-Length": String(avatar.body.byteLength),
      "Content-Type": avatar.contentType,
    },
  });
}
