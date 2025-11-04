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
    return <div>Invalid folder ID</div>;
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
