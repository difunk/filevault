"use client";

import { ChevronRight } from "lucide-react";
import { FileRow, FolderRow } from "./file-row";
import type { files_table, folders_table } from "~/server/db/schema";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { UploadButton } from "~/components/ui/uploadthing";
import { useRouter } from "next/navigation";
import { createFolder } from "~/server/actions";

export default function DriveContents(props: {
  files: (typeof files_table.$inferSelect)[];
  folders: (typeof folders_table.$inferSelect)[];
  parents: (typeof folders_table.$inferSelect)[];

  currentFolderId: number;
  rootFolderId: number;
}) {
  const navigate = useRouter();
  return (
    <div className="min-h-screen bg-neutral-900 p-8 text-neutral-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href={`/f/${props.rootFolderId}`}
              className="mr-2 text-neutral-300 transition-colors hover:text-white"
            >
              My Drive
            </Link>
            {props.parents.map((folder) => (
              <div key={folder.id} className="flex items-center">
                <ChevronRight className="mx-2 text-neutral-500" size={16} />
                <Link
                  href={`/f/${folder.id}`}
                  className="text-neutral-300 transition-colors hover:text-white"
                >
                  {folder.name}
                </Link>
              </div>
            ))}
          </div>
          <div>
            <SignedOut>
              <button className="h-10 cursor-pointer rounded-md border border-neutral-700 bg-neutral-800 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-700 sm:h-12 sm:px-5 sm:text-base">
                <SignInButton />
              </button>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
        <div className="rounded-lg border border-neutral-700 bg-neutral-800 shadow-xl">
          <div className="border-b border-neutral-700 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-neutral-400">
              <div className="col-span-6">Name</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-3">Size</div>
              <div className="col-span-1"></div>
            </div>
          </div>
          <ul>
            {props.folders.map((folder) => (
              <FolderRow key={folder.id} folder={folder} />
            ))}
            {props.files.map((file) => (
              <FileRow key={file.id} file={file} />
            ))}
          </ul>
        </div>
        <div className="mt-6 flex flex-col items-center justify-center gap-4">
          <div className="flex gap-4">
            <button
              onClick={async () => {
                const folderName = window.prompt("Enter folder name:");
                if (folderName && folderName.trim()) {
                  await createFolder(folderName.trim(), props.currentFolderId);
                  navigate.refresh();
                }
              }}
              className="rounded-md border border-neutral-700 bg-neutral-800 px-6 py-3 font-medium text-white transition-colors hover:bg-neutral-700"
            >
              Create Folder
            </button>
            <UploadButton
              endpoint="driveUploader"
              onClientUploadComplete={() => {
                navigate.refresh();
              }}
              config={{
                mode: "auto",
              }}
              appearance={{
                button:
                  "uploadBtn border border-neutral-700 bg-neutral-800 text-white transition-colors hover:bg-neutral-700 px-6 py-3 rounded-md font-medium cursor-pointer ut-ready:bg-neutral-800 ut-uploading:bg-neutral-700",
                allowedContent: "hidden",
                container: "w-auto",
              }}
              content={{
                button({ ready, isUploading }) {
                  if (isUploading) return "Uploading...";
                  if (ready) return "Upload Files";
                  return "Getting ready...";
                },
                allowedContent: () => "",
              }}
              input={{
                folderId: props.currentFolderId,
              }}
            />
          </div>
          <p className="mt-2 text-sm text-neutral-400">Max file size: 1GB</p>
        </div>
      </div>
    </div>
  );
}
