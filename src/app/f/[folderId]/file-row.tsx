import {
  Folder as FolderIcon,
  FileIcon,
  Trash2Icon,
  EllipsisVertical,
  Link2,
} from "lucide-react";
import type { folders_table, files_table } from "~/server/db/schema";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  createFileShareLink,
  deleteFile,
  deleteFolder,
  renameFile,
  renameFolder,
  revokeFileShareLink,
} from "~/server/actions";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? (parts.pop()?.toUpperCase() ?? "FILE") : "FILE";
}

export function FileRow(props: {
  file: typeof files_table.$inferSelect & { share?: { token: string } | null };
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: () => void;
  onClick?: (e: React.MouseEvent) => void | boolean;
  "data-item-id"?: number;
  "data-item-type"?: string;
  isDragging?: boolean;
}) {
  const { file } = props;
  const navigate = useRouter();

  return (
    <li
      className={`border-b border-neutral-700 transition-all duration-200 ${
        props.isDragging
          ? "dragging z-10 scale-105 transform bg-blue-500/20 opacity-60 shadow-lg"
          : "hover:bg-neutral-750 cursor-move"
      }`}
      draggable="true"
      onDragStart={(_e) => {
        props.onDragStart?.();
      }}
      onDragEnd={(_e) => {
        props.onDragEnd?.();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        props.onDragOver?.(e);
      }}
      onTouchStart={props.onTouchStart}
      onTouchMove={props.onTouchMove}
      onTouchEnd={props.onTouchEnd}
      onClick={props.onClick}
      data-item-id={props["data-item-id"]}
      data-item-type={props["data-item-type"]}
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
        WebkitTapHighlightColor: "transparent",
        touchAction: "none",
      }}
    >
      {/* Mobile Layout (< 640px) */}
      <div className="block px-4 py-4 sm:hidden">
        <div className="flex items-start justify-between gap-3">
          {/* Linke Seite: Icon + Datei Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <FileIcon className="text-neutral-400" size={18} />
                {file.share && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                {file.url ? (
                  <a
                    href={file.url}
                    className="block truncate font-medium text-neutral-100 hover:text-blue-400"
                    target="_blank"
                    rel="noopener noreferrer"
                    draggable="false"
                    onTouchStart={(e) => {
                      // Prevent parent touch events from interfering
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      if (props.onClick) {
                        const result = props.onClick(e);
                        if (result === false) {
                          e.preventDefault();
                          e.stopPropagation();
                          return;
                        }
                      }
                    }}
                  >
                    {file.name}
                  </a>
                ) : (
                  <div className="truncate font-medium text-neutral-100">
                    {file.name}
                  </div>
                )}
                <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                  <span>{getFileExtension(file.name)}</span>
                  <span>•</span>
                  <span>{formatFileSize(file.size)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rechte Seite: Share + Aktionen */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                const result = await createFileShareLink(file.id);

                if (typeof result !== "string") {
                  window.alert(result?.error ?? "Could not create share link");
                  return;
                }

                try {
                  await navigator.clipboard.writeText(result);
                  window.alert(
                    file.share
                      ? "Share link copied to clipboard"
                      : "Share link created and copied to clipboard",
                  );
                } catch {
                  window.prompt("Copy this share link:", result);
                }

                navigate.refresh();
              }}
              aria-label={
                file.share?.token ? "Copy share link" : "Create share link"
              }
              className="h-9 w-9 text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-neutral-100"
            >
              <Link2 size={16} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-neutral-100">
                <EllipsisVertical size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-50 rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-2 shadow-xl">
                {file.share?.token && (
                  <DropdownMenuItem
                    onClick={async () => {
                      await revokeFileShareLink(file.id);
                      window.alert("sharing has been revoked");
                      navigate.refresh();
                    }}
                  >
                    Disable share link
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={async () => {
                    const fileName = window.prompt(
                      "Enter file name:",
                      file.name,
                    );
                    if (fileName?.trim()) {
                      await renameFile(file.id, file.ownerId, fileName.trim());
                      navigate.refresh();
                    }
                  }}
                  className="hover:bg-neutral-700 hover:text-neutral-100"
                >
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    if (window.confirm(`Delete "${file.name}"?`)) {
                      await deleteFile(file.id);
                      navigate.refresh();
                    }
                  }}
                  className="text-red-400 hover:bg-red-600/20 hover:text-red-300"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Desktop Layout (>= 640px) */}
      <div className="hidden px-6 py-4 sm:block">
        <div className="grid grid-cols-12 items-center gap-4">
          <div className="col-span-6 flex items-center">
            {file.url ? (
              <a
                draggable="false"
                href={file.url}
                className="flex items-center text-neutral-100 transition-colors hover:text-neutral-300"
                target="_blank"
                rel="noopener noreferrer"
                onTouchStart={(e) => {
                  // Prevent parent touch events from interfering
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  if (props.onClick) {
                    const result = props.onClick(e);
                    if (result === false) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                  }
                }}
              >
                <div className="relative mr-3 flex-shrink-0">
                  <FileIcon className="text-neutral-400" size={20} />
                  {file.share && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-400" />
                  )}
                </div>
                {file.name}
              </a>
            ) : (
              <div className="flex items-center text-neutral-100">
                <div className="relative mr-3 flex-shrink-0">
                  <FileIcon className="text-neutral-400" size={20} />
                  {file.share && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-400" />
                  )}
                </div>
                {file.name}
              </div>
            )}
          </div>
          <div className="col-span-2 text-neutral-400">
            <span>{getFileExtension(file.name)}</span>
          </div>
          <div className="col-span-2 text-neutral-400">
            <span>{formatFileSize(file.size)}</span>
          </div>
          <div className="col-span-1 flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  const result = await createFileShareLink(file.id);

                  if (typeof result !== "string") {
                    window.alert(result?.error ?? "Could not create share link");
                    return;
                  }

                  try {
                    await navigator.clipboard.writeText(result);
                    window.alert(
                      file.share
                        ? "Share link copied to clipboard"
                        : "Share link created and copied to clipboard",
                    );
                  } catch {
                    window.prompt("Copy this share link:", result);
                  }

                  navigate.refresh();
                }}
                aria-label={
                  file.share ? "Copy share link" : "Create share link"
                }
                className="h-9 w-9 text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-neutral-100"
              >
                <Link2 size={16} />
              </Button>            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                if (window.confirm(`Delete "${file.name}"?`)) {
                  await deleteFile(file.id);
                  navigate.refresh();
                }
              }}
              aria-label="Delete file"
              className="h-9 w-9 text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-red-400"
            >
              <Trash2Icon size={16} />
            </Button>
          </div>
          <div className="col-span-1">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-neutral-100">
                <EllipsisVertical size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-50 rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-2 shadow-xl">
                {file.share?.token && (
                  <DropdownMenuItem
                    onClick={async () => {
                      await revokeFileShareLink(file.id);
                      window.alert("sharing has been revoked");
                      navigate.refresh();
                    }}
                  >
                    Disable share link
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={async () => {
                    const fileName = window.prompt("Enter file name:");
                    if (fileName?.trim()) {
                      await renameFile(file.id, file.ownerId, fileName.trim());
                      navigate.refresh();
                    }
                  }}
                  className="hover:bg-neutral-700 hover:text-neutral-100"
                >
                  Rename
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </li>
  );
}

export function FolderRow(props: {
  folder: typeof folders_table.$inferSelect & { size: number };
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onClick?: (e: React.MouseEvent) => void | boolean;
  onTouchEnd?: () => void;
  "data-item-id"?: number;
  "data-item-type"?: string;
  isDragging?: boolean;
}) {
  const { folder } = props;
  const navigate = useRouter();

  return (
    <li
      className={`border-b border-neutral-700 transition-all duration-200 ${
        props.isDragging
          ? "dragging z-10 scale-105 transform bg-blue-500/20 opacity-60 shadow-lg"
          : "hover:bg-neutral-750 cursor-move"
      }`}
      draggable="true"
      onDragStart={(_e) => {
        props.onDragStart?.();
      }}
      onDragEnd={(_e) => {
        props.onDragEnd?.();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        props.onDragOver?.(e);
      }}
      onTouchStart={props.onTouchStart}
      onTouchMove={props.onTouchMove}
      onTouchEnd={props.onTouchEnd}
      onClick={props.onClick}
      data-item-id={props["data-item-id"]}
      data-item-type={props["data-item-type"]}
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
        WebkitTapHighlightColor: "transparent",
        touchAction: "none",
      }}
    >
      {/* Mobile Layout (< 640px) */}
      <div className="block px-4 py-4 sm:hidden">
        <div className="flex items-center justify-between gap-3">
          {/* Linke Seite: Icon + Ordner Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <FolderIcon className="flex-shrink-0 text-blue-400" size={18} />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/f/${folder.id}`}
                  className="block truncate font-medium text-neutral-100 hover:text-blue-400"
                  draggable="false"
                  onTouchStart={(e) => {
                    // Prevent parent touch events from interfering
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    if (props.onClick) {
                      const result = props.onClick(e);
                      if (result === false) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                    }
                  }}
                >
                  {folder.name}
                </Link>
                <div className="mt-1 text-xs text-neutral-500">Folder</div>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-neutral-100">
              <EllipsisVertical size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-50 rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-2 shadow-xl">
              <DropdownMenuItem
                onClick={async () => {
                  const folderName = window.prompt(
                    "Enter folder name:",
                    folder.name,
                  );
                  if (folderName?.trim()) {
                    await renameFolder(
                      folder.id,
                      folder.ownerId,
                      folderName.trim(),
                    );
                    navigate.refresh();
                  }
                }}
                className="hover:bg-neutral-700 hover:text-neutral-100"
              >
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  if (window.confirm(`Delete "${folder.name}"?`)) {
                    await deleteFolder(folder.id);
                    navigate.refresh();
                  }
                }}
                className="text-red-400 hover:bg-red-600/20 hover:text-red-300"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Desktop Layout (>= 640px) */}
      <div className="hidden px-6 py-4 sm:block">
        <div className="grid grid-cols-12 items-center gap-4">
          <div className="col-span-6 flex items-center">
            <Link
              draggable="false"
              href={`/f/${folder.id}`}
              className="flex items-center text-neutral-100 transition-colors hover:text-neutral-300"
              onTouchStart={(e) => {
                // Prevent parent touch events from interfering
                e.stopPropagation();
              }}
              onClick={(e) => {
                if (props.onClick) {
                  const result = props.onClick(e);
                  if (result === false) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                }
              }}
            >
              <FolderIcon className="mr-3 text-blue-400" size={20} />
              {folder.name}
            </Link>
          </div>
          <div className="col-span-2 text-neutral-400">Folder</div>
          <div className="col-span-2 text-neutral-400">
            <span>
              {folder.size !== undefined ? formatFileSize(folder.size) : "—"}
            </span>
          </div>
          <div className="col-span-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await deleteFolder(folder.id);
                navigate.refresh();
              }}
              aria-label="Delete folder"
              className="h-9 w-9 text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-red-400"
            >
              <Trash2Icon size={16} />
            </Button>
          </div>
          <div className="col-span-1">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-neutral-100">
                <EllipsisVertical size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-50 rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-2 shadow-xl">
                <DropdownMenuItem
                  onClick={async () => {
                    const folderName = window.prompt(
                      "Enter folder name:",
                      folder.name,
                    );
                    if (folderName?.trim()) {
                      await renameFolder(
                        folder.id,
                        folder.ownerId,
                        folderName.trim(),
                      );
                      navigate.refresh();
                    }
                  }}
                  className="hover:bg-neutral-700 hover:text-neutral-100"
                >
                  Rename
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </li>
  );
}
