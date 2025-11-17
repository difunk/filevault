"use client";

import { ChevronRight } from "lucide-react";
import { FileRow, FolderRow } from "./file-row";
import type { files_table, folders_table } from "~/server/db/schema";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { UploadButton } from "~/components/ui/uploadthing";
import { useRouter } from "next/navigation";
import { createFolder, reorderItems } from "~/server/actions";
import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";

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

  const combinedItems = useMemo((): CombinedItem[] => {
    const combined = [
      ...props.folders.map((folder) => ({
        ...folder,
        type: "folder" as const,
      })),
      ...props.files.map((file) => ({ ...file, type: "file" as const })),
    ];

    return combined.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }, [props.files, props.folders]);

  const [sortedItems, setSortedItems] = useState(combinedItems);

  useEffect(() => {
    setSortedItems(combinedItems);
  }, [combinedItems]);

  const [draggedItem, setDraggedItem] = useState<CombinedItem | null>(null);

  // Touch State for mobile
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null);
  const [isTouching, setIsTouching] = useState(false);
  const [touchTimer, setTouchTimer] = useState<NodeJS.Timeout | null>(null);
  const [preventNextClick, setPreventNextClick] = useState(false);

  const handleDragStart = (item: CombinedItem) => {
    setDraggedItem(item);
    console.log(item);
  };

  const handleDragEnd = async () => {
    if (!draggedItem) return;

    const reorderedItems = sortedItems.map((item, index) => ({
      id: item.id,
      type: item.type,
      newPosition: index + 1,
    }));

    setDraggedItem(null);

    try {
      await reorderItems(reorderedItems);

      setTimeout(() => {
        navigate.refresh();
      }, 100);
    } catch (error) {
      console.error(error);
      navigate.refresh();
    }
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

  // Touch Event Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent, item: CombinedItem) => {
    e.preventDefault();

    const touch = e.touches[0];
    if (!touch) return;

    // Clear any existing timer
    if (touchTimer) {
      clearTimeout(touchTimer);
    }

    setTouchStartY(touch.clientY);
    setTouchCurrentY(touch.clientY);

    // Set timer for 1 second hold
    const timer = setTimeout(() => {
      setDraggedItem(item);
      setIsTouching(true);
      console.log("Touch start (after 1s hold):", item.name);
    }, 1000);

    setTouchTimer(timer);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // If user moves finger before 1 second, cancel the timer
    if (touchTimer && !isTouching) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
      setTouchStartY(null);
      setTouchCurrentY(null);
      return;
    }

    if (!touchStartY || !draggedItem) return;

    e.preventDefault();

    const touch = e.touches[0];
    if (!touch) return;
    setTouchCurrentY(touch.clientY);

    // Find element under touch
    const elementBelow = document.elementFromPoint(
      touch.clientX,
      touch.clientY,
    );
    const listItem = elementBelow?.closest("li");

    if (listItem) {
      const itemId = listItem.getAttribute("data-item-id");
      const itemType = listItem.getAttribute("data-item-type");

      if (itemId && itemType) {
        const targetItem = sortedItems.find(
          (item) => item.id.toString() === itemId && item.type === itemType,
        );

        if (targetItem && targetItem.id !== draggedItem.id) {
          // Same logic as handleDragOver
          const newItems = [...sortedItems];
          const dragIndex = newItems.findIndex(
            (item) =>
              item.id === draggedItem.id && item.type === draggedItem.type,
          );
          const targetIndex = newItems.findIndex(
            (item) =>
              item.id === targetItem.id && item.type === targetItem.type,
          );

          if (dragIndex !== -1 && targetIndex !== -1) {
            const [draggedElement] = newItems.splice(dragIndex, 1);
            if (draggedElement) {
              newItems.splice(targetIndex, 0, draggedElement);
              setSortedItems(newItems);
            }
          }
        }
      }
    }
  };

  const handleTouchEnd = async () => {
    // Clear timer if touch ends before 1 second
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }

    if (!draggedItem) {
      // Reset touch state if no drag was initiated
      setTouchStartY(null);
      setTouchCurrentY(null);
      setIsTouching(false);
      return;
    }

    setPreventNextClick(true);

    setTimeout(() => {
      setPreventNextClick(false);
    }, 200);

    setIsTouching(false);
    setTouchStartY(null);
    setTouchCurrentY(null);

    await handleDragEnd();
  };

  // Click handler to prevent opening after drag & drop
  const handleItemClick = (e: React.MouseEvent, item: CombinedItem) => {
    if (preventNextClick) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Prevented click after drag & drop for:", item.name);
      return false;
    }
    // Return undefined (void) for normal clicks
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
          <ul
            style={{
              WebkitUserSelect: 'none',
              userSelect: 'none',
              WebkitTouchCallout: 'none',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            {sortedItems.map((item) => {
              if (item.type === "folder") {
                return (
                  <FolderRow
                    key={`folder-${item.id}`}
                    folder={item}
                    onDragStart={() => handleDragStart(item)}
                    onDragEnd={() => handleDragEnd()}
                    onDragOver={(e) => handleDragOver(e, item)}
                    onTouchStart={(e) => handleTouchStart(e, item)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onClick={(e) => handleItemClick(e, item)}
                    data-item-id={item.id}
                    data-item-type="folder"
                    isDragging={
                      draggedItem?.id === item.id &&
                      draggedItem?.type === item.type
                    }
                  />
                );
              } else {
                return (
                  <FileRow
                    key={`file-${item.id}`}
                    file={item}
                    onDragStart={() => handleDragStart(item)}
                    onDragEnd={() => handleDragEnd()}
                    onDragOver={(e) => handleDragOver(e, item)}
                    onTouchStart={(e) => handleTouchStart(e, item)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onClick={(e) => handleItemClick(e, item)}
                    data-item-id={item.id}
                    data-item-type="file"
                    isDragging={
                      draggedItem?.id === item.id &&
                      draggedItem?.type === item.type
                    }
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

        {/* Touch Feedback for mobile */}
        {isTouching && draggedItem && (
          <div
            className="pointer-events-none fixed z-50 rounded bg-blue-500 p-2 text-white shadow-lg"
            style={{
              left: "50%",
              top: touchCurrentY ?? 0,
              transform: "translateX(-50%)",
            }}
          >
            Moving: {draggedItem.name}
          </div>
        )}
      </div>
    </div>
  );
}
