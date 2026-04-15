import { subDays } from "date-fns";

export type DailyBucket<K extends string> = {
  dateKey: string;
  label: string;
} & Record<K, number>;

export function buildDailyBuckets<K extends string>(
  days: number,
  fields: readonly K[],
): { list: DailyBucket<K>[]; byKey: Map<string, DailyBucket<K>> } {
  const byKey = new Map<string, DailyBucket<K>>();
  const list = Array.from({ length: days }, (_, index) => {
    const date = subDays(new Date(), days - 1 - index);
    const counters = Object.fromEntries(fields.map((f) => [f, 0])) as Record<
      K,
      number
    >;
    const bucket: DailyBucket<K> = {
      dateKey: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      ...counters,
    };
    byKey.set(bucket.dateKey, bucket);
    return bucket;
  });
  return { list, byKey };
}

export function fillDailyBucket<K extends string>(
  byKey: Map<string, DailyBucket<K>>,
  rows: { createdAt: Date }[],
  field: K,
) {
  for (const row of rows) {
    const key = row.createdAt.toISOString().slice(0, 10);
    const bucket = byKey.get(key);
    if (!bucket) continue;
    const counters = bucket as unknown as Record<string, number>;
    counters[field] = (counters[field] ?? 0) + 1;
  }
}
