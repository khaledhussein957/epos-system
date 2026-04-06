import { ZodError } from "zod";

export const formatZodError = (error: ZodError): string => {
  const firstIssue = error.issues[0];
  if (!firstIssue) return "Validation error";

  const path = firstIssue.path.join(".");
  const message = firstIssue.message;

  return path ? `${path}: ${message}` : message;
};