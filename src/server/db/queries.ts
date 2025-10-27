import "server-only";

import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import {
  files_table as filesSchema,
  folders_table as foldersSchema,
} from "~/server/db/schema";

export const QUERIES = {
  getAllParentsForFolder: async function (folderId: number) {
    const parents = [];

    const currentFolder = await db
      .selectDistinct()
      .from(foldersSchema)
      .where(eq(foldersSchema.id, folderId));

    if (!currentFolder[0]) {
      throw new Error("Folder not found");
    }

    let currentId: number | null = currentFolder[0].parent;

    while (currentId !== null) {
      const folder = await db
        .selectDistinct()
        .from(foldersSchema)
        .where(eq(foldersSchema.id, currentId));

      if (!folder[0]) {
        throw new Error("Folder not found");
      }
      parents.unshift(folder[0]);
      currentId = folder[0]?.parent;
    }
    return parents;
  },

  getFolders: function (folderId: number) {
    return db
      .select()
      .from(foldersSchema)
      .where(eq(foldersSchema.parent, folderId));
  },

  getFiles: function (folderId: number) {
    return db
      .select()
      .from(filesSchema)
      .where(eq(filesSchema.parent, folderId));
  },
};
