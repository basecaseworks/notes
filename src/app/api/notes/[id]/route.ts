import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { getAuthenticatedUser } from "@/server/auth";
import { deleteNote, findNote, updateNote } from "@/server/services/notes";
import { noteIdSchema, noteUpdateSchema } from "@/server/validation/notes";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

function publicNote(note: NonNullable<Awaited<ReturnType<typeof findNote>>>) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

async function getUser(request: Request) {
  return getAuthenticatedUser(request.headers);
}

async function getNoteId(context: RouteContext) {
  const { id } = await context.params;
  return noteIdSchema.safeParse(id);
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const parsedId = await getNoteId(context);
    if (!parsedId.success) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    const note = await findNote(db, user.id, parsedId.data);
    if (!note) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    return NextResponse.json({ note: publicNote(note) });
  } catch (error) {
    console.error("Could not load note.", error);
    return NextResponse.json({ error: "Could not load note." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const parsedId = await getNoteId(context);
    if (!parsedId.success) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    const body = await request.json().catch(() => null);
    const parsed = noteUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid note." },
        { status: 400 },
      );
    }

    const note = await updateNote(db, user.id, parsedId.data, parsed.data);
    if (!note) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    return NextResponse.json({ note: publicNote(note) });
  } catch (error) {
    console.error("Could not update note.", error);
    return NextResponse.json({ error: "Could not update note." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const parsedId = await getNoteId(context);
    if (!parsedId.success) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    const deleted = await deleteNote(db, user.id, parsedId.data);
    if (!deleted) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Could not delete note.", error);
    return NextResponse.json({ error: "Could not delete note." }, { status: 500 });
  }
}
