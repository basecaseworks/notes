import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { getAuthenticatedUser } from "@/server/auth";
import { createNote, listNotes } from "@/server/services/notes";
import { noteCreateSchema } from "@/server/validation/notes";

export const runtime = "nodejs";

function publicNote(note: Awaited<ReturnType<typeof listNotes>>[number]) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request.headers);

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const rows = await listNotes(db, user.id);
    return NextResponse.json({ notes: rows.map(publicNote) });
  } catch (error) {
    console.error("Could not load notes.", error);
    return NextResponse.json({ error: "Could not load notes." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request.headers);

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = noteCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid note." },
        { status: 400 },
      );
    }

    const note = await createNote(db, user.id, parsed.data);
    return NextResponse.json({ note: publicNote(note) }, { status: 201 });
  } catch (error) {
    console.error("Could not create note.", error);
    return NextResponse.json({ error: "Could not create note." }, { status: 500 });
  }
}
