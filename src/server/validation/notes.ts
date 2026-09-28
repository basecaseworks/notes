import { z } from "zod";

export const noteIdSchema = z.string().uuid();

export const noteCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200, "Title must be 200 characters or fewer."),
  content: z.string().max(100_000, "Content must be 100,000 characters or fewer."),
});

export const noteUpdateSchema = noteCreateSchema
  .partial()
  .refine((value) => value.title !== undefined || value.content !== undefined, {
    message: "At least one field is required.",
  });

export type NoteCreateInput = z.infer<typeof noteCreateSchema>;
export type NoteUpdateInput = z.infer<typeof noteUpdateSchema>;
