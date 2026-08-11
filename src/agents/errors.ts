import i18n from "@/langs";

export class AiError extends Error {
  constructor(
    message: string,
    public readonly code: "unavailable" | "network" | "schema" | "cancelled" | "unknown" = "unknown",
  ) {
    super(message);
    this.name = "AiError";
  }
}

export function readableAiError(error: unknown): string {
  if (error instanceof AiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return i18n.global.t("errors.aiUnavailable");
}
