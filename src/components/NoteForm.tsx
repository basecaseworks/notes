"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

type NoteFormProps = {
  note?: Note;
};

export function NoteForm({ note }: NoteFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(note ? `/api/notes/${note.id}` : "/api/notes", {
        method: note ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error ?? "Could not save note.");
        return;
      }

      if (note) {
        router.push(`/notes/${note.id}`);
      } else {
        router.push(`/notes/${payload.note.id}`);
      }
      router.refresh();
    } catch {
      setError("Could not save note.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          required
          disabled={isSaving}
        />
      </div>

      <div className="form-field">
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={100000}
          disabled={isSaving}
        />
      </div>

      {error ? <p className="error-message" role="alert">{error}</p> : null}

      <div className="form-actions">
        <button className="button" type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : note ? "Save changes" : "Create note"}
        </button>
        <button className="button secondary" type="button" onClick={() => router.back()} disabled={isSaving}>
          Cancel
        </button>
      </div>
    </form>
  );
}
