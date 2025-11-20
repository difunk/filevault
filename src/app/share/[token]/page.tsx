import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { files_table, file_shares_table } from "~/server/db/schema";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

interface FileShare {
  id: number;
  fileId: number;
  ownerId: string;
  token: string;
  createdAt: Date;
}

interface FileRecord {
  id: number;
  ownerId: string;
  name: string;
  size: number;
  url: string;
  parent: number;
  createdAt: Date;
  position: number | null;
}

export default async function SharePage(props: SharePageProps) {
  const params = await props.params;
  const { token } = params;

  // Find share record by token
  const shares = await db
    .select()
    .from(file_shares_table)
    .where(eq(file_shares_table.token, token));

  if (!shares || shares.length === 0) {
    notFound();
  }

  const share = shares[0] as FileShare | undefined;

  if (!share) {
    notFound();
  }

  // Get file details
  const files = await db
    .select()
    .from(files_table)
    .where(eq(files_table.id, share.fileId));

  if (!files || files.length === 0) {
    notFound();
  }

  const file = files[0] as FileRecord | undefined;

  if (!file) {
    notFound();
  }

  // Display file with download option - don't expose the real URL
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 px-4 py-8 text-neutral-100">
      <div className="w-full max-w-md rounded-lg border border-neutral-700 bg-neutral-800 p-6 shadow-xl">
        <h1 className="mb-4 text-2xl font-bold">Shared File</h1>

        <div className="mb-6 space-y-3 rounded-lg bg-neutral-700 p-4">
          <div>
            <p className="text-sm text-neutral-400">File Name</p>
            <p className="truncate font-medium">{file.name}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-400">File Size</p>
            <p className="font-medium">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>

        <a
          href={`/api/download/${token}`}
          className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-center font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
        >
          Download File
        </a>

        <p className="mt-4 text-xs text-neutral-500">
          This file was shared securely with you. Direct access is protected by
          a secret token.
        </p>
      </div>
    </div>
  );
}
