import { z } from "zod";
export const STORAGE_KEY = "loop-learning-v1";
export const progressSchema = z.object({
  version: z.literal(1),
  drafts: z.record(z.string().max(16000)),
  completed: z.array(z.string()).max(100),
  runs: z.array(z.object({ id: z.string(), date: z.string(), passed: z.boolean() })).max(1000),
  lastChallenge: z.string(),
  theme: z.enum(["dark", "light"]),
  name: z.string().max(32),
  welcomed: z.boolean().default(false),
});
export type Progress = z.infer<typeof progressSchema>;
export const emptyProgress: Progress = { version: 1, drafts: {}, completed: [], runs: [], lastChallenge: "first-message", theme: "dark", name: "", welcomed: false };
export function readProgress(): Progress {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...emptyProgress };
  const result = progressSchema.safeParse(JSON.parse(raw));
  if (!result.success) throw new Error("Saved data could not be read.");
  return result.data;
}
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
