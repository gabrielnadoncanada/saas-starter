export class AiModelSelectionError extends Error {
  code: "MODEL_NOT_ALLOWED" | "UNKNOWN_MODEL";

  constructor(code: "MODEL_NOT_ALLOWED" | "UNKNOWN_MODEL", message: string) {
    super(message);
    this.code = code;
  }
}
