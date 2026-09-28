"use client";

import Link from "next/link";
import { NoteForm } from "@/components/NoteForm";

export default function NewNotePage() {
  return (
    <main>
      <Link className="back-link" href="/notes">Back to notes</Link>
      <h1>New note</h1>
      <NoteForm />
    </main>
  );
}
