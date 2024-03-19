import { ZodEnum, z } from "zod";

export const zSortBy = z.enum([
  "timestamp_asc",
  "timestamp_dsc",
  "username_asc",
  "username_dsc",
  "language_asc",
  "language_dsc",
]);

export const zLanguage = z.enum(["cpp", "java", "javascript", "python"]);
export const zStatus = z.enum(["success", "failure", "error", "api_failure"]);

function parseJsonArray<T extends ZodEnum<any>>(enumSchema: T) {
  return z.string().transform((value) => {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        // Check if all elements in the array are valid enum values
        const allValid = parsed.every(
          (item) => enumSchema.safeParse(item).success
        );
        if (allValid) {
          return parsed;
        } else {
          throw new Error("Array contains invalid enum values");
        }
      } else {
        throw new Error("Value is not an array");
      }
    } catch (error) {
      throw new Error("Invalid JSON array format");
    }
  });
}

export const zSearchParams = z.object({
  username: z.string().optional(),
  language: parseJsonArray(zLanguage).optional(),
  status: parseJsonArray(zStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: zSortBy.default("timestamp_dsc"),
});

export const zSubmissionParams = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^(?![-.])[a-zA-Z0-9._-]+(?<![-.])$/),
  language: zLanguage,
  stdin: z.string(),
  code: z.string(),
});

export type SortBy = z.infer<typeof zSortBy>;
export type Language = z.infer<typeof zLanguage>;
export type Status = z.infer<typeof zStatus>;
export type SearchParams = z.infer<typeof zSearchParams>;
