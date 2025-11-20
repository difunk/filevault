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

  // Fetch all data in parallel
  const [folders, files, parents, rootFolder, shares] = await Promise.all([
    QUERIES.getFoldersWithSizes(parsedFolderId, session.userId),
    QUERIES.getFiles(parsedFolderId),
    QUERIES.getAllParentsForFolder(parsedFolderId),
    QUERIES.getRootFolderForUser(session.userId),
    QUERIES.getSharesForUser(session.userId),
  ]);

  // Create a map of fileId -> share info for easy lookup
  const shareMap = new Map(shares.map((share) => [share.fileId, share]));

  return (
    <DriveContents
      folders={folders}
      files={files}
      parents={parents}
      currentFolderId={parsedFolderId}
      rootFolderId={rootFolder?.id ?? 1}
      shareMap={shareMap}
    />
  );
}
