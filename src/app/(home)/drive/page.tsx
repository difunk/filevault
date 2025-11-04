import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MUTATIONS, QUERIES } from "~/server/db/queries";

export default async function DrivePage() {
  const session = await auth();

  if (!session.userId) {
    return redirect("sign-in");
  }

  const rootFolder = await QUERIES.getRootFolderForUser(session.userId);

  if (!rootFolder) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 px-4 text-center">
        <form
          action={async () => {
            "use server";
            const session = await auth();

            if (!session.userId) {
              return redirect("sign-in");
            }

            const rootFolderId = await MUTATIONS.onboardUser(session.userId);
            return redirect(`/f/${rootFolderId}`);
          }}
        >
          <button
            type="submit"
            className="rounded-md border border-neutral-700 bg-neutral-800 px-6 py-3 font-medium text-white transition-colors hover:bg-neutral-700"
          >
            Create new drive
          </button>
        </form>
      </div>
    );
  }

  return redirect(`/f/${rootFolder.id}`);
}
