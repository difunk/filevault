"use server";

import { and, eq } from "drizzle-orm";
import { files_table, folders_table } from "./db/schema";
import { db } from "./db";
import { auth } from "@clerk/nextjs/server";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";
import { MUTATIONS } from "./db/queries";

const utApi = new UTApi();

function extractFileKey(url: string): string {
  const regex = /\/f\/(.+)$/;
  const match = regex.exec(url);
  return match?.[1] ?? url;
}

export async function deleteFile(fileId: number) {
  const session = await auth();

  if (!session.userId) {
    return { error: "Unauthorized" };
  }
  const [file] = await db
    .select()
    .from(files_table)
    .where(
      and(eq(files_table.id, fileId), eq(files_table.ownerId, session.userId)),
    );

  if (!file) {
    return { error: "File not found" };
  }

  const utapiResult = await utApi.deleteFiles([extractFileKey(file.url)]);

  console.log("utapi delete files:");
  console.log(utapiResult);

  const dbDeleteResult = await db
    .delete(files_table)
    .where(eq(files_table.id, fileId));

  console.log("utapi delete results:");
  console.log(dbDeleteResult);

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export async function renameFile(fileId: number, userId: string, name: string) {
  const session = await auth();

  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  const [selectedFile] = await db
    .select()
    .from(files_table)
    .where(and(eq(files_table.id, fileId), eq(files_table.ownerId, userId)));

  if (!selectedFile) {
    return { error: "File not found" };
  }

  const originalName = selectedFile.name;
  const originalExtension = originalName.includes(".")
    ? "." + originalName.split(".").pop()
    : "";
  let newName = name.trim();
  if (originalExtension && !newName.includes(".")) {
    newName = newName + originalExtension;
  }

  const utapiResult = await utApi.renameFiles({
    fileKey: extractFileKey(selectedFile.url),
    newName: newName,
  });

  const updateResult = await db
    .update(files_table)
    .set({ name: newName })
    .where(and(eq(files_table.id, fileId), eq(files_table.ownerId, userId)));

  console.log(updateResult);

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

async function deleteFolderContentsRecursively(
  folderId: number,
  userId: string,
) {
  // find all files inside the folder
  const filesInFolder = await db
    .select()
    .from(files_table)
    .where(
      and(eq(files_table.parent, folderId), eq(files_table.ownerId, userId)),
    );

  // check if files were found
  if (filesInFolder.length > 0) {
    const files = filesInFolder.map((file) => extractFileKey(file.url));

    // delete files from upload thingwas
    await utApi.deleteFiles(files);

    // delete files from db
    await db
      .delete(files_table)
      .where(
        and(eq(files_table.parent, folderId), eq(files_table.ownerId, userId)),
      );
  }

  // find all sub folders inside the folder
  const subFolders = await db
    .select()
    .from(folders_table)
    .where(
      and(
        eq(folders_table.parent, folderId),
        eq(folders_table.ownerId, userId),
      ),
    );

  await Promise.all(
    subFolders.map(async (subFolder) => {
      await deleteFolderContentsRecursively(subFolder.id, userId);
      await db.delete(folders_table).where(eq(folders_table.id, subFolder.id));
    }),
  );
}

export async function deleteFolder(folderId: number) {
  const session = await auth();

  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  const [folder] = await db
    .select()
    .from(folders_table)
    .where(
      and(
        eq(folders_table.id, folderId),
        eq(folders_table.ownerId, session.userId),
      ),
    );

  if (!folder) {
    return { error: "Folder not found" };
  }

  await deleteFolderContentsRecursively(folderId, session.userId);

  // kill directory itself
  await db.delete(folders_table).where(and(eq(folders_table.id, folderId)));

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export async function createFolder(name: string, parentId: number) {
  const session = await auth();

  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  await MUTATIONS.createFolder({
    name: name,
    parent: parentId,
    userId: session.userId,
  });

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export async function renameFolder(
  folderId: number,
  userId: string,
  name: string,
) {
  const session = await auth();

  if (!session.userId) {
    throw new Error("Unauthorized");
  }

  const [selectedFolder] = await db
    .select()
    .from(folders_table)
    .where(
      and(eq(folders_table.id, folderId), eq(folders_table.ownerId, userId)),
    );

  if (!selectedFolder) {
    throw new Error("Folder not found");
  }

  const newName = name.trim();
  if (!newName) {
    throw new Error("Name cannot be empty");
  }

  const updateResult = await db
    .update(folders_table)
    .set({ name: newName })
    .where(
      and(eq(folders_table.id, folderId), eq(folders_table.ownerId, userId)),
    );

  console.log(updateResult);

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export async function reorderItems(
  items: Array<{ id: number; type: "file" | "folder"; newPosition: number }>,
) {
  const session = await auth();

  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  try {
    await MUTATIONS.reorderItems(items, session.userId);

    const c = await cookies();
    c.set("force-refresh", JSON.stringify(Math.random()));

    return { success: true };
  } catch (error) {
    console.error("Reorder error:", error);
    return { error: "Failed to reorder items" };
  }
}
