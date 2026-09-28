"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

type Note = {
  id: string;
  title: string;
  updatedAt: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadNotes() {
      try {
        const response = await fetch("/api/notes", { cache: "no-store" });
        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(payload?.error ?? "Could not load notes.");
        }

        if (active) {
          setNotes(payload.notes);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Could not load notes.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadNotes();
    return () => {
      active = false;
    };
  }, [router]);

  async function logOut() {
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <main>
      <header className="page-header">
        <h1>Notes</h1>
        <button className="button secondary" type="button" onClick={logOut}>Log out</button>
      </header>

      <section aria-labelledby="notes-heading">
        <div className="section-header">
          <h2 id="notes-heading">Your notes</h2>
          <Link className="button" href="/notes/new">New note</Link>
        </div>

        {isLoading ? (
          <div className="loading-state"><p>Loading...</p></div>
        ) : error ? (
          <div className="empty-state"><p className="error-message" role="alert">{error}</p></div>
        ) : notes.length === 0 ? (
          <div className="empty-state"><p>No notes yet.</p></div>
        ) : (
          <div className="notes-list">
            {notes.map((note) => (
              <Link className="note-row" href={`/notes/${note.id}`} key={note.id}>
                <span className="note-row-title">{note.title}</span>
                <span className="note-row-date">{formatDate(note.updatedAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
