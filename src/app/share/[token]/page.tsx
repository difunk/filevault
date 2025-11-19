import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "~/server/db";
import { files_table } from "~/server/db/schema";

interface SharePageProps {
  params: { token: string };
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = params;

  const [file] = await db
    .select()
    .from(files_table)
    .where(eq(files_table.shareToken, token));

  if (!file) {
    notFound();
  }

  if (file.url) {
    redirect(file.url);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-900 text-neutral-100">
      <p>File cannot be shared.</p>
    </div>
  );
}
