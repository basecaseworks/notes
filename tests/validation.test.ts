import { describe, expect, it } from "vitest";
import { noteCreateSchema, noteIdSchema, noteUpdateSchema } from "@/server/validation/notes";

describe("note validation", () => {
  it("accepts a title and content", () => {
    expect(noteCreateSchema.parse({ title: "  Grocery list  ", content: "Milk" })).toEqual({
      title: "Grocery list",
      content: "Milk",
    });
  });

  it("rejects an empty or excessively long title", () => {
    expect(noteCreateSchema.safeParse({ title: "", content: "" }).success).toBe(false);
    expect(noteCreateSchema.safeParse({ title: "a".repeat(201), content: "" }).success).toBe(false);
  });

  it("rejects an excessively long body", () => {
    expect(noteCreateSchema.safeParse({ title: "Note", content: "a".repeat(100001) }).success).toBe(false);
  });

  it("requires at least one field when updating", () => {
    expect(noteUpdateSchema.safeParse({}).success).toBe(false);
    expect(noteUpdateSchema.safeParse({ content: "Updated" }).success).toBe(true);
  });

  it("accepts UUID note ids only", () => {
    expect(noteIdSchema.safeParse("not-a-uuid").success).toBe(false);
    expect(noteIdSchema.safeParse("123e4567-e89b-42d3-a456-426614174000").success).toBe(true);
  });
});
