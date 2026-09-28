"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NoteForm } from "@/components/NoteForm";

type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

export default function NotePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadNote() {
      try {
        const response = await fetch(`/api/notes/${params.id}`, { cache: "no-store" });
        if (response.status === 401) {
          router.replace("/login");
          return;
        }
        if (response.status === 404) {
          setNotFound(true);
          return;
        }

        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(payload?.error ?? "Could not load note.");
        }

        if (active) {
          setNote(payload.note);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Could not load note.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadNote();
    return () => {
      active = false;
    };
  }, [params.id, router]);

  async function handleDelete() {
    if (!window.confirm("Delete this note?")) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/notes/${params.id}`, { method: "DELETE" });
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Could not delete note.");
      }

      router.replace("/notes");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete note.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return <main><p className="loading-state">Loading...</p></main>;
  }

  if (notFound) {
    return (
      <main>
        <h1>Note not found</h1>
        <p>The note may have been deleted or you may not have access to it.</p>
        <Link href="/notes">Back to notes</Link>
      </main>
    );
  }

  if (!note) {
    return (
      <main>
        <h1>Could not load note</h1>
        <p className="error-message" role="alert">{error ?? "Please try again."}</p>
        <Link href="/notes">Back to notes</Link>
      </main>
    );
  }

  return (
    <main>
      <Link className="back-link" href="/notes">Back to notes</Link>
      <h1>Edit note</h1>
      <p className="note-meta">Last updated {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(note.updatedAt))}</p>
      <NoteForm note={note} />
      <div className="form-actions" style={{ marginTop: "32px" }}>
        <button className="button danger" type="button" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? "Deleting..." : "Delete note"}
        </button>
        {error ? <p className="error-message" role="alert">{error}</p> : null}
      </div>
    </main>
  );
}
