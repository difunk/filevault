import { NextRequest } from "next/server";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { file_shares_table, files_table } from "~/server/db/schema";

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const { token } = params;

  // Find share record by token
  const shares = await db
    .select()
    .from(file_shares_table)
    .where(eq(file_shares_table.token, token));

  if (!shares || shares.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  const share = shares[0];

  // Get file details
  const files = await db
    .select()
    .from(files_table)
    .where(eq(files_table.id, share.fileId));

  if (!files || files.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  const file = files[0];

  // Fetch the file from UploadThing
  const fileRes = await fetch(file.url);
  if (!fileRes.ok) {
    return new Response("File not found", { status: 404 });
  }

  // Stream the file to the client
  return new Response(fileRes.body, {
    status: 200,
    headers: {
      "Content-Type": fileRes.headers.get("Content-Type") || "application/octet-stream",
      "Content-Disposition": `attachment; filename=\"${file.name}\"`,
      "Content-Length": file.size.toString(),
    },
  });
}
