import { Folder as FolderIcon, FileIcon, Trash2Icon } from "lucide-react";
import type { folders_table, files_table } from "~/server/db/schema";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { deleteFile, deleteFolder } from "~/server/actions";

export function FileRow(props: { file: typeof files_table.$inferSelect }) {
  const { file } = props;
  return (
    <li
      key={file.id}
      className="hover:bg-neutral-750 border-b border-neutral-700 px-6 py-4 transition-colors"
    >
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
        <div className="col-span-2 text-neutral-400">{"file"}</div>
        <div className="col-span-3 text-neutral-400">{file.size}</div>
        <div className="col-span-1 text-neutral-400">
          <Button
            variant="ghost"
            onClick={() => deleteFile(file.id)}
            aria-label="Delete file"
            className="text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-neutral-200"
          >
            <Trash2Icon size={20} />
          </Button>
        </div>
      </div>
    </li>
  );
}

export function FolderRow(props: {
  folder: typeof folders_table.$inferSelect;
}) {
  const { folder } = props;
  return (
    <li
      key={folder.id}
      className="hover:bg-neutral-750 border-b border-neutral-700 px-6 py-4 transition-colors"
    >
      <div className="grid grid-cols-12 items-center gap-4">
        <div className="col-span-6 flex items-center">
          <Link
            href={`/f/${folder.id}`}
            className="flex items-center text-neutral-100 transition-colors hover:text-neutral-300"
          >
            <FolderIcon className="mr-3 text-neutral-400" size={20} />
            {folder.name}
          </Link>
        </div>
        <div className="col-span-2 text-neutral-400"></div>
        <div className="col-span-3 text-neutral-400"></div>
        <div className="col-span-1 text-neutral-400">
          <Button
            variant="ghost"
            onClick={() => deleteFolder(folder.id)}
            aria-label="Delete file"
            className="text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-neutral-200"
          >
            <Trash2Icon size={20} />
          </Button>
        </div>
      </div>
    </li>
  );
}
