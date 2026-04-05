import { NextResponse } from "next/server";

import { requireActiveOrganizationMembership } from "@/features/organizations/server/organization-membership";
import {
  getStoredFileRecord,
  readStoredFileBody,
} from "@/features/storage/server/storage-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ storedFileId: string }> },
) {
  try {
    const membership = await requireActiveOrganizationMembership();
    const { storedFileId } = await context.params;
    const storedFile = await getStoredFileRecord(
      storedFileId,
      membership.organizationId,
    );

    if (!storedFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const body = await readStoredFileBody(storedFile.storageKey);
    const arrayBuffer = body.buffer.slice(
      body.byteOffset,
      body.byteOffset + body.byteLength,
    ) as ArrayBuffer;
    const blob = new Blob([arrayBuffer], { type: storedFile.contentType });

    return new NextResponse(blob, {
      headers: {
        "Cache-Control": "private, max-age=0, must-revalidate",
        "Content-Disposition": `attachment; filename="${storedFile.fileName}"`,
        "Content-Length": String(storedFile.sizeBytes),
        "Content-Type": storedFile.contentType,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to download file",
      },
      { status: 400 },
    );
  }
}
