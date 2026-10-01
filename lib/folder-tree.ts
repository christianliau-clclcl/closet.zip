import type { Folder, Item } from "@/lib/types";

// Working with the folder tree in the browser. Pure helpers: no database.

// The folders directly inside a folder (or the top-level ones, for none),
// keeping the order they arrived in.
export function childFolders(folders: Folder[], parentId: string | undefined): Folder[] {
  return folders.filter((folder) => folder.parentId === parentId);
}

// From the top down to this folder: [Seasons, Summer]. Empty for none.
export function folderPath(folders: Folder[], id: string | undefined): Folder[] {
  const byId = new Map(folders.map((folder) => [folder.id, folder]));
  const path: Folder[] = [];
  const seen = new Set<string>(); // the database prevents loops; this is a seatbelt
  for (let folder = id ? byId.get(id) : undefined; folder && !seen.has(folder.id); ) {
    seen.add(folder.id);
    path.unshift(folder);
    folder = folder.parentId ? byId.get(folder.parentId) : undefined;
  }
  return path;
}

// How many folders sit inside this one, at any depth (deleting it deletes them).
export function countFoldersInside(folders: Folder[], id: string): number {
  return childFolders(folders, id).reduce((total, child) => total + 1 + countFoldersInside(folders, child.id), 0);
}

// The pieces directly in a folder, in the folder's order.
export function itemsInFolder(items: Item[], folder: Folder): Item[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  return folder.itemIds.flatMap((id) => byId.get(id) ?? []);
}

// The piece shown as the folder's cover: the chosen one, else the first.
export function folderCover(items: Item[], folder: Folder): Item | undefined {
  const inFolder = itemsInFolder(items, folder);
  return inFolder.find((item) => item.id === folder.coverItemId) ?? inFolder[0];
}

// "07": counts in labels are two digits, like the category rows.
export function twoDigits(count: number): string {
  return String(count).padStart(2, "0");
}

export const MAX_FOLDER_NAME = 60;
