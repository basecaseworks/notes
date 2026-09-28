import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { auth } from "@/server/auth";
import { db, sql } from "@/db/client";
import { account, notes, session, user } from "@/db/schema";
import { createNote, deleteNote, findNote, listNotes, updateNote } from "@/server/services/notes";

const databaseAvailable = Boolean(process.env.DATABASE_URL || process.env.TEST_DATABASE_URL);

describe.skipIf(!databaseAvailable)("notes integration", () => {
  const timestamp = Date.now();
  const userA = {
    name: "User A",
    email: `notes-a-${timestamp}@example.com`,
    password: "correct-horse-battery-staple",
  };
  const userB = {
    name: "User B",
    email: `notes-b-${timestamp}@example.com`,
    password: "correct-horse-battery-staple",
  };
  let userAId = "";
  let userBId = "";

  beforeAll(async () => {
    const signupA = await auth.api.signUpEmail({ body: userA });
    const signupB = await auth.api.signUpEmail({ body: userB });
    expect(signupA.user).toBeTruthy();
    expect(signupB.user).toBeTruthy();
    userAId = signupA.user.id;
    userBId = signupB.user.id;
  });

  beforeEach(async () => {
    await db.delete(notes);
  });

  it("registers and signs in with email and password", async () => {
    const result = await auth.api.signInEmail({
      body: { email: userA.email, password: userA.password },
    });

    expect(result.user.id).toBe(userAId);
    expect(result.token).toBeTruthy();
  });

  it("creates, edits, lists, and deletes a note for its owner", async () => {
    const note = await createNote(db, userAId, { title: "First", content: "Text" });
    expect(note.title).toBe("First");
    expect((await listNotes(db, userAId)).map((row) => row.id)).toContain(note.id);

    const updated = await updateNote(db, userAId, note.id, { title: "Updated" });
    expect(updated?.title).toBe("Updated");
    expect((await findNote(db, userAId, note.id))?.content).toBe("Text");

    expect(await deleteNote(db, userAId, note.id)).toBe(true);
    expect(await findNote(db, userAId, note.id)).toBeNull();
  });

  it("does not expose or modify another user's note", async () => {
    const note = await createNote(db, userAId, { title: "Private", content: "Only A" });

    expect(await listNotes(db, userBId)).toHaveLength(0);
    expect(await findNote(db, userBId, note.id)).toBeNull();
    expect(await updateNote(db, userBId, note.id, { title: "Changed" })).toBeNull();
    expect(await deleteNote(db, userBId, note.id)).toBe(false);
    expect((await findNote(db, userAId, note.id))?.title).toBe("Private");
  });

  afterAll(async () => {
    await db.delete(session).where(eq(session.userId, userAId));
    await db.delete(session).where(eq(session.userId, userBId));
    await db.delete(account).where(eq(account.userId, userAId));
    await db.delete(account).where(eq(account.userId, userBId));
    await db.delete(user).where(eq(user.id, userAId));
    await db.delete(user).where(eq(user.id, userBId));
    await sql.end();
  });
});
