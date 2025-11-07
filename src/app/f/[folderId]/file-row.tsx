import {
  Folder as FolderIcon,
  FileIcon,
  Trash2Icon,
  EllipsisVertical,
} from "lucide-react";
import type { folders_table, files_table } from "~/server/db/schema";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  deleteFile,
  deleteFolder,
  renameFile,
  renameFolder,
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

export function FileRow(props: { file: typeof files_table.$inferSelect }) {
  const { file } = props;
  const navigate = useRouter();

  return (
    <li className="hover:bg-neutral-750 border-b border-neutral-700 transition-colors">
      {/* Mobile Layout (< 640px) */}
      <div className="block px-4 py-4 sm:hidden">
        <div className="flex items-start justify-between gap-3">
          {/* Linke Seite: Icon + Datei Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <FileIcon className="flex-shrink-0 text-neutral-400" size={18} />
              <div className="min-w-0 flex-1">
                {file.url ? (
                  <a
                    href={file.url}
                    className="block truncate font-medium text-neutral-100 hover:text-blue-400"
                    target="_blank"
                    rel="noopener noreferrer"
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

          {/* Rechte Seite: 3-Punkte Menü */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-neutral-100">
              <EllipsisVertical size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-50 rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-2 shadow-xl">
              <DropdownMenuItem
                onClick={async () => {
                  const fileName = window.prompt("Enter file name:", file.name);
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

      {/* Desktop Layout (>= 640px) */}
      <div className="hidden px-6 py-4 sm:block">
        <div className="grid grid-cols-12 items-center gap-4">
          <div className="col-span-6 flex items-center">
            {file.url ? (
              <a
                href={file.url}
                className="flex items-center text-neutral-100 transition-colors hover:text-neutral-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileIcon className="mr-3 text-neutral-400" size={20} />
                {file.name}
              </a>
            ) : (
              <div className="flex items-center text-neutral-100">
                <FileIcon className="mr-3 text-neutral-400" size={20} />
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
          <div className="col-span-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await deleteFile(file.id);
                navigate.refresh();
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
  folder: typeof folders_table.$inferSelect;
}) {
  const { folder } = props;
  const navigate = useRouter();

  return (
    <li className="hover:bg-neutral-750 border-b border-neutral-700 transition-colors">
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
              href={`/f/${folder.id}`}
              className="flex items-center text-neutral-100 transition-colors hover:text-neutral-300"
            >
              <FolderIcon className="mr-3 text-blue-400" size={20} />
              {folder.name}
            </Link>
          </div>
          <div className="col-span-2 text-neutral-400">Folder</div>
          <div className="col-span-2 text-neutral-400">—</div>
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
