export type FieldErrors<TValues extends Record<string, unknown>> = Partial<
  Record<Extract<keyof TValues, string>, string[]>
>;

export type BillingErrorCode = "UPGRADE_REQUIRED" | "LIMIT_REACHED";

export type FormActionState<
  TValues extends Record<string, unknown> = Record<string, never>,
> = {
  error?: string;
  errorCode?: BillingErrorCode;
  success?: string;
  values?: Partial<TValues>;
  fieldErrors?: FieldErrors<TValues>;
};
