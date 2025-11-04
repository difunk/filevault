import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DriveContents from "~/app/f/[folderId]/drive-contents";
import { QUERIES } from "~/server/db/queries";

export default async function GoogleDriveClone(props: {
  params: Promise<{ folderId: string }>;
}) {
  const session = await auth();
  if (!session.userId) {
    return redirect("sign-in");
  }

  const params = await props.params;

  const parsedFolderId = parseInt(params.folderId);
  if (isNaN(parsedFolderId)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 px-4 text-center">
        <div className="text-neutral-400">Invalid folder ID</div>
      </div>
    );
  }

  const [folders, files, parents, rootFolder] = await Promise.all([
    QUERIES.getFolders(parsedFolderId),
    QUERIES.getFiles(parsedFolderId),
    QUERIES.getAllParentsForFolder(parsedFolderId),
    QUERIES.getRootFolderForUser(session.userId),
  ]);

  return (
    <DriveContents
      folders={folders}
      files={files}
      parents={parents}
      currentFolderId={parsedFolderId}
      rootFolderId={rootFolder?.id ?? 1}
    />
  );
}
