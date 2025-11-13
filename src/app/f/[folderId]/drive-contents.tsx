"use client";

import { ChevronRight } from "lucide-react";
import { FileRow, FolderRow } from "./file-row";
import type { files_table, folders_table } from "~/server/db/schema";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { UploadButton } from "~/components/ui/uploadthing";
import { useRouter } from "next/navigation";
import { createFolder, reorderItems } from "~/server/actions";
import React, { useState } from "react";
import { MUTATIONS } from "~/server/db/queries";

export default function DriveContents(props: {
  files: (typeof files_table.$inferSelect)[];
  folders: (typeof folders_table.$inferSelect & { size: number })[];
  parents: (typeof folders_table.$inferSelect)[];

  currentFolderId: number;
  rootFolderId: number;
}) {
  const navigate = useRouter();

  type CombinedItem =
    | (typeof files_table.$inferSelect & { type: "file" })
    | (typeof folders_table.$inferSelect & { size: number; type: "folder" });

  const [sortedItems, setSortedItems] = useState(() => {
    const combined = [
      ...props.folders.map((folder) => ({
        ...folder,
        type: "folder" as const,
      })),
      ...props.files.map((file) => ({ ...file, type: "file" as const })),
    ];

    return combined.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  });

  const [draggedItem, setDraggedItem] = useState<CombinedItem | null>(null);

  const handleDragStart = (item: CombinedItem) => {
    setDraggedItem(item);
    console.log(item);
  };

  const handleDragEnd = async (item: CombinedItem) => {
    if (!draggedItem) return;

    const reorderedItems = sortedItems.map((item, index) => ({
      id: item.id,
      type: item.type,
      newPosition: index + 1,
    }));

    try {
      await reorderItems(reorderedItems);
    } catch (error) {
      console.error(error);
      navigate.refresh();
    }

    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent, targetItem: CombinedItem) => {
    e.preventDefault();

    if (!draggedItem || draggedItem.id === targetItem.id) return;

    const newItems = [...sortedItems];
    const dragIndex = newItems.findIndex(
      (item) => item.id === draggedItem.id && item.type === draggedItem.type,
    );
    const targetIndex = newItems.findIndex(
      (item) => item.id === targetItem.id && item.type === targetItem.type,
    );

    if (dragIndex === -1 || targetIndex === -1) return;

    const [draggedElement] = newItems.splice(dragIndex, 1);

    if (!draggedElement) return;
    newItems.splice(targetIndex, 0, draggedElement);

    setSortedItems(newItems);
  };

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
          {/* Mobile Header */}
          <div className="border-b border-neutral-700 px-4 py-4 sm:hidden">
            <div className="flex justify-between text-sm font-medium text-neutral-400">
              <div>Name</div>
              <div>Actions</div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden border-b border-neutral-700 px-6 py-4 sm:block">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-neutral-400">
              <div className="col-span-6">Name</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2 lg:col-span-2">Size</div>
              <div className="col-span-2">Actions</div>
            </div>
          </div>
          <ul>
            {sortedItems.map((item) => {
              if (item.type === "folder") {
                return (
                  <FolderRow
                    key={`folder-${item.id}`}
                    folder={item}
                    onDragStart={() => handleDragStart(item)}
                    onDragEnd={() => handleDragEnd(item)}
                    onDragOver={(e) => handleDragOver(e, item)}
                  />
                );
              } else {
                return (
                  <FileRow
                    key={`file-${item.id}`}
                    file={item}
                    onDragStart={() => handleDragStart(item)}
                    onDragEnd={() => handleDragEnd(item)}
                    onDragOver={(e) => handleDragOver(e, item)}
                  />
                );
              }
            })}
          </ul>
        </div>
        <div className="mt-6 flex flex-col items-center justify-center gap-4">
          <div className="flex gap-4">
            <button
              onClick={async () => {
                const folderName = window.prompt("Enter folder name:");
                if (folderName?.trim()) {
                  await createFolder(folderName.trim(), props.currentFolderId);
                  navigate.refresh();
                }
              }}
              className="ut-ready:bg-neutral-800 ut-uploading:bg-neutral-700 flex h-[50px] cursor-pointer items-center justify-center rounded-md border border-neutral-700 bg-neutral-800 px-6 py-3 font-medium text-white transition-colors hover:bg-neutral-700"
            >
              Create Folder
            </button>
            <div className="flex h-[50px] items-center">
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
                    "uploadBtn h-[50px] flex items-center justify-center border border-neutral-700 bg-neutral-800 text-white transition-colors hover:bg-neutral-700 px-6 py-3 rounded-md font-medium cursor-pointer ut-ready:bg-neutral-800 ut-uploading:bg-neutral-700",
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
          </div>
          <p className="mt-2 text-sm text-neutral-400">Max file size: 1GB</p>
        </div>
      </div>
    </div>
  );
}
