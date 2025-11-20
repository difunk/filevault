import "server-only";

import { and, asc, eq, isNull, max } from "drizzle-orm";
import { db } from "~/server/db";
import {
  files_table as filesSchema,
  folders_table as foldersSchema,
  file_shares_table as sharesSchema,
} from "~/server/db/schema";

export const QUERIES = {
  getFolderSizeRecursively: async function (
    folderId: number,
    userId: string,
  ): Promise<number> {
    const filesInFolder = await db
      .select({ size: filesSchema.size })
      .from(filesSchema)
      .where(
        and(eq(filesSchema.parent, folderId), eq(filesSchema.ownerId, userId)),
      );

    let totalSize = 0;

    if (filesInFolder.length > 0) {
      totalSize = filesInFolder.reduce((sum, file) => sum + file.size, 0);
    }

    const subFolders = await db
      .select({ id: foldersSchema.id })
      .from(foldersSchema)
      .where(
        and(
          eq(foldersSchema.parent, folderId),
          eq(foldersSchema.ownerId, userId),
        ),
      );

    for (const subFolder of subFolders) {
      totalSize += await this.getFolderSizeRecursively(subFolder.id, userId);
    }

    return totalSize;
  },

  getFoldersWithSizes: async function (parentFolderId: number, userId: string) {
    const folders = await db
      .select()
      .from(foldersSchema)
      .where(
        and(
          eq(foldersSchema.parent, parentFolderId),
          eq(foldersSchema.ownerId, userId),
        ),
      );

    const foldersWithSizes = await Promise.all(
      folders.map(async (folder) => ({
        ...folder,
        size: await this.getFolderSizeRecursively(folder.id, userId),
      })),
    );

    return foldersWithSizes;
  },

  getAllParentsForFolder: async function (folderId: number) {
    const parents = [];

    const currentFolder = await db
      .selectDistinct()
      .from(foldersSchema)
      .where(eq(foldersSchema.id, folderId));

    if (!currentFolder[0]) {
      throw new Error("Folder not found");
    }

    parents.push(currentFolder[0]);

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

  getFolderById: async function (folderId: number) {
    const folder = await db
      .select()
      .from(foldersSchema)
      .where(eq(foldersSchema.id, folderId));
    return folder[0];
  },

  getRootFolderForUser: async function (userId: string) {
    const folder = await db
      .select()
      .from(foldersSchema)
      .where(
        and(eq(foldersSchema.ownerId, userId), isNull(foldersSchema.parent)),
      );
    return folder[0];
  },

  getFolders: function (folderId: number) {
    return db
      .select()
      .from(foldersSchema)
      .where(eq(foldersSchema.parent, folderId))
      .orderBy(asc(foldersSchema.position), asc(foldersSchema.id));
  },

  getFiles: function (folderId: number) {
    return db
      .select()
      .from(filesSchema)
      .where(eq(filesSchema.parent, folderId))
      .orderBy(asc(filesSchema.position), asc(filesSchema.id));
  },

  isFileShared: async function (fileId: number, userId: string) {
    const shares = await db
      .select()
      .from(sharesSchema)
      .where(
        and(eq(sharesSchema.fileId, fileId), eq(sharesSchema.ownerId, userId)),
      );
    return shares.length > 0;
  },

  getSharesForUser: async function (userId: string) {
    return db
      .select()
      .from(sharesSchema)
      .where(eq(sharesSchema.ownerId, userId));
  },

  getMaxPosition: async function (folderId: number, type: "file" | "folder") {
    if (type === "file") {
      const result = await db
        .select({ maxPos: max(filesSchema.position) })
        .from(filesSchema)
        .where(eq(filesSchema.parent, folderId));

      return result[0]?.maxPos ?? 0;
    } else {
      const result = await db
        .select({ maxPos: max(foldersSchema.position) })
        .from(foldersSchema)
        .where(eq(foldersSchema.parent, folderId));

      return result[0]?.maxPos ?? 0;
    }
  },
};

export const MUTATIONS = {
  reorderItems: async function (
    items: Array<{ id: number; type: "file" | "folder"; newPosition: number }>,
    userId: string,
  ) {
    for (const item of items) {
      if (item.type === "file") {
        await db
          .update(filesSchema)
          .set({ position: item.newPosition })
          .where(
            and(eq(filesSchema.id, item.id), eq(filesSchema.ownerId, userId)),
          );
      } else {
        await db
          .update(foldersSchema)
          .set({ position: item.newPosition })
          .where(
            and(
              eq(foldersSchema.id, item.id),
              eq(foldersSchema.ownerId, userId),
            ),
          );
      }
    }
  },

  createFile: async function (input: {
    file: {
      name: string;
      size: number;
      url: string;
      parent: number;
    };
    userId: string;
  }) {
    const maxPosition = await QUERIES.getMaxPosition(input.file.parent, "file");

    return await db.insert(filesSchema).values({
      ...input.file,
      ownerId: input.userId,
      position: maxPosition + 1,
    });
  },

  createFolder: async function (input: {
    name: string;
    parent: number;
    userId: string;
  }) {
    const maxPosition = await QUERIES.getMaxPosition(input.parent, "folder");

    return await db.insert(foldersSchema).values({
      name: input.name,
      parent: input.parent,
      ownerId: input.userId,
      position: maxPosition + 1,
    });
  },

  onboardUser: async function (userId: string) {
    const rootFolder = await db
      .insert(foldersSchema)
      .values({
        name: "Root",
        parent: null,
        ownerId: userId,
        position: 0,
      })
      .$returningId();

    const rootFolderId = rootFolder[0]!.id;

    await db.insert(foldersSchema).values([
      {
        name: "Trash",
        parent: rootFolderId,
        ownerId: userId,
        position: 1,
      },
      {
        name: "Shared",
        parent: rootFolderId,
        ownerId: userId,
        position: 2,
      },
      {
        name: "Documents",
        parent: rootFolderId,
        ownerId: userId,
        position: 3,
      },
    ]);

    return rootFolderId;
  },
};
