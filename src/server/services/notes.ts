import { and, desc, eq } from "drizzle-orm";
import type { db } from "@/db/client";
import { notes } from "@/db/schema";
import type { NoteCreateInput, NoteUpdateInput } from "@/server/validation/notes";

type Database = typeof db;

export function listNotes(database: Database, userId: string) {
  return database
    .select()
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.updatedAt), desc(notes.id));
}

export function findNote(database: Database, userId: string, noteId: string) {
  return database
    .select()
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .limit(1)
    .then((rows) => rows[0] ?? null);
}

export function createNote(database: Database, userId: string, input: NoteCreateInput) {
  return database
    .insert(notes)
    .values({
      userId,
      title: input.title,
      content: input.content,
    })
    .returning()
    .then((rows) => rows[0]);
}

export function updateNote(
  database: Database,
  userId: string,
  noteId: string,
  input: NoteUpdateInput,
) {
  return database
    .update(notes)
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.content !== undefined ? { content: input.content } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning()
    .then((rows) => rows[0] ?? null);
}

export function deleteNote(database: Database, userId: string, noteId: string) {
  return database
    .delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning({ id: notes.id })
    .then((rows) => rows.length > 0);
}
