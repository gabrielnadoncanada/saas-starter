import { describe, expect, it } from "vitest";

import {
  buildTasksTableHref,
  parseTaskTableSearchParams,
  TASK_TABLE_DEFAULTS,
} from "@/features/tasks/task-table-search-params";

describe("task table search params", () => {
  it("uses defaults when params are missing", () => {
    expect(parseTaskTableSearchParams({})).toEqual({
      ...TASK_TABLE_DEFAULTS,
      q: undefined,
      status: [],
      priority: [],
    });
  });

  it("falls back to the default page and pageSize", () => {
    expect(
      parseTaskTableSearchParams({
        page: "0",
        pageSize: "999",
      }),
    ).toMatchObject({
      page: TASK_TABLE_DEFAULTS.page,
      pageSize: TASK_TABLE_DEFAULTS.pageSize,
    });
  });

  it("parses CSV filters for status and priority", () => {
    expect(
      parseTaskTableSearchParams({
        status: "TODO,DONE",
        priority: ["HIGH,LOW"],
      }),
    ).toMatchObject({
      status: ["TODO", "DONE"],
      priority: ["HIGH", "LOW"],
    });
  });

  it("omits default values when building the href", () => {
    expect(
      buildTasksTableHref("/dashboard/tasks", {
        ...TASK_TABLE_DEFAULTS,
        q: undefined,
        status: [],
        priority: [],
      }),
    ).toBe("/dashboard/tasks");
  });

  it("includes only non-default values when building the href", () => {
    expect(
      buildTasksTableHref("/dashboard/tasks", {
        ...TASK_TABLE_DEFAULTS,
        page: 2,
        q: "billing",
        status: ["TODO"],
        priority: ["HIGH"],
      }),
    ).toBe("/dashboard/tasks?page=2&q=billing&status=TODO&priority=HIGH");
  });
});
