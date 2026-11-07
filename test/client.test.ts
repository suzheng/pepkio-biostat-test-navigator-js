import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PepkioClient } from "../src/client.js";
import {
  DEFAULT_API_BASE_URL,
  TOOL_ID,
  apiPath,
  resolveApiKey,
  resolveBaseUrl,
} from "../src/config.js";
import { parseRunInput } from "../src/schemas.js";
import { PepkioAPIError } from "../src/types.js";

const MOCK_MANIFEST = {
  schema_version: "1.0",
  tool_id: "biostat-test-navigator",
  title: "Biostat Test Navigator",
  description: "Guided statistical test chooser for life-science experiments",
  execution_mode: "sync",
  examples: [
    {
      name: "qpcr_two_group_mann_whitney",
      description: "Nonparametric comparison of two qPCR groups",
      input: {
        template_id: "qpcr",
        outcome_type: "continuous",
        comparison_type: "two_groups",
        group_count: 2,
        paired: false,
        groups: [
          { name: "Control", values: [1.02, 0.98, 1.05, 1.01] },
          { name: "Treatment", values: [2.45, 2.51, 2.38, 2.62] },
        ],
      },
      output: {
        ready: true,
        primary_test_key: "mann_whitney",
      },
    },
    {
      name: "survival_log_rank",
      description: "Survival analysis",
      input: {
        template_id: "survival",
        outcome_type: "survival",
        comparison_type: "two_groups",
        group_count: 2,
      },
      output: {
        ready: true,
        primary_test_key: "log_rank",
      },
    },
    {
      name: "categorical_fisher_small_cells",
      description: "Fisher exact test",
      input: {
        outcome_type: "categorical",
        comparison_type: "two_groups",
        categorical_table: [
          [8, 2],
          [3, 12],
        ],
      },
      output: {
        ready: true,
        primary_test_key: "fisher_exact",
      },
    },
  ],
};

const MOCK_RUN_RESULT = {
  run_id: "run-biostat-123",
  status: "completed",
  result: {
    ready: true,
    primary_test: "Mann-Whitney U test",
    primary_test_key: "mann_whitney",
    effect_size_metric: "Cliff's delta",
    rationale: "Two independent groups, non-normal or small n.",
    warnings: [],
  },
  error: null,
  result_url: "https://tools.pepkio.com/api/tools/v1/runs/run-biostat-123",
  permalink: "https://tools.pepkio.com/r/run-biostat-123",
};

describe("PepkioClient unit tests", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("getManifest() fetches and returns tool_id", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => JSON.stringify(MOCK_MANIFEST),
    });

    const client = new PepkioClient({ apiKey: "test-key" });
    const manifest = await client.getManifest();

    expect(manifest.tool_id).toBe(TOOL_ID);
    expect(manifest.title).toBe("Biostat Test Navigator");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://tools.pepkio.com/api/tools/v1/tools/biostat-test-navigator/manifest",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("caches getManifest() calls", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => JSON.stringify(MOCK_MANIFEST),
    });
    globalThis.fetch = fetchMock;

    const client = new PepkioClient({ apiKey: "test-key" });
    await client.getManifest();
    await client.getManifest();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("listExamples() extracts examples from manifest", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => JSON.stringify(MOCK_MANIFEST),
    });

    const client = new PepkioClient({ apiKey: "test-key" });
    const examples = await client.getExamples();

    expect(examples).toHaveLength(3);
    expect(examples[0]?.name).toBe("qpcr_two_group_mann_whitney");
    expect(examples[1]?.name).toBe("survival_log_rank");
    expect(examples[2]?.name).toBe("categorical_fisher_small_cells");
  });

  it("getExampleInput() retrieves and parses example", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => JSON.stringify(MOCK_MANIFEST),
    });

    const client = new PepkioClient({ apiKey: "test-key" });
    const input = await client.getExampleInput("qpcr_two_group_mann_whitney");

    expect(input.template_id).toBe("qpcr");
    expect(input.outcome_type).toBe("continuous");
    expect(input.comparison_type).toBe("two_groups");
    expect(input.groups).toHaveLength(2);
  });

  it("getExampleInput() throws on unknown example name", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => JSON.stringify(MOCK_MANIFEST),
    });

    const client = new PepkioClient({ apiKey: "test-key" });
    await expect(client.getExampleInput("non_existent")).rejects.toThrow(
      /Example "non_existent" not found/,
    );
  });

  it("run() sends validated input and options", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => JSON.stringify(MOCK_RUN_RESULT),
    });

    const client = new PepkioClient({ apiKey: "test-key" });
    const result = await client.run(
      {
        template_id: "qpcr",
        outcome_type: "continuous",
        comparison_type: "two_groups",
        groups: [{ name: "A", values: [1, 2] }],
      },
      { label: "test-run" },
    );

    expect(result.status).toBe("completed");
    expect(result.run_id).toBe("run-biostat-123");
    expect(result.result?.primary_test).toBe("Mann-Whitney U test");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://tools.pepkio.com/api/tools/v1/tools/biostat-test-navigator/run",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          input: {
            template_id: "qpcr",
            outcome_type: "continuous",
            comparison_type: "two_groups",
            groups: [{ name: "A", values: [1, 2] }],
          },
          options: { label: "test-run" },
        }),
      }),
    );
  });

  it("run() throws 401 when apiKey is missing", async () => {
    const client = new PepkioClient({ apiKey: "" });
    await expect(
      client.run({
        outcome_type: "continuous",
        comparison_type: "two_groups",
      }),
    ).rejects.toThrow(/API key required/);
  });

  it("convenience helpers call run() with appropriate parameters", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => JSON.stringify(MOCK_RUN_RESULT),
    });

    const client = new PepkioClient({ apiKey: "test-key" });

    await client.navigate({ outcome_type: "continuous", comparison_type: "two_groups" });
    await client.compareGroups([
      { name: "Ctrl", values: [1, 2, 3] },
      { name: "Tx", values: [4, 5, 6] },
    ]);
    await client.analyzeContingencyTable([
      [10, 5],
      [2, 14],
    ]);

    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
  });

  it("getRun() fetches previous run by ID", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => JSON.stringify(MOCK_RUN_RESULT),
    });

    const client = new PepkioClient({ apiKey: "test-key" });
    const result = await client.getRun("run-biostat-123");

    expect(result.run_id).toBe("run-biostat-123");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://tools.pepkio.com/api/tools/v1/runs/run-biostat-123",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("waitForRun() polls until run is completed", async () => {
    const queuedResponse = {
      run_id: "async-run-1",
      status: "running",
    };
    const completedResponse = {
      run_id: "async-run-1",
      status: "completed",
      result: {
        ready: true,
        primary_test: "Student t-test",
      },
    };

    let calls = 0;
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      calls++;
      return {
        ok: true,
        status: 200,
        statusText: "OK",
        text: async () => JSON.stringify(calls > 1 ? completedResponse : queuedResponse),
      };
    });

    const client = new PepkioClient({ apiKey: "test-key" });
    const result = await client.waitForRun("async-run-1", {
      intervalMs: 10,
      timeoutMs: 500,
    });

    expect(result.status).toBe("completed");
    expect(calls).toBe(2);
  });

  it("waitForRun() throws on timeout", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => JSON.stringify({ run_id: "run-slow", status: "running" }),
    });

    const client = new PepkioClient({ apiKey: "test-key" });
    await expect(
      client.waitForRun("run-slow", { intervalMs: 10, timeoutMs: 50 }),
    ).rejects.toThrow(/Timed out/);
  });

  it("throws PepkioAPIError on HTTP 500 error", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: async () => JSON.stringify({ error: { message: "Internal compute failed" } }),
    });

    const client = new PepkioClient({ apiKey: "test-key" });
    await expect(
      client.run({ outcome_type: "continuous", comparison_type: "two_groups" }),
    ).rejects.toThrow("Internal compute failed");
  });

  it("throws PepkioAPIError when error field is present in response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () =>
        JSON.stringify({
          run_id: "failed-run-1",
          status: "failed",
          error: "At least two groups required",
        }),
    });

    const client = new PepkioClient({ apiKey: "test-key" });
    await expect(
      client.run({ outcome_type: "continuous", comparison_type: "two_groups" }),
    ).rejects.toThrow("At least two groups required");
  });

  describe("config helpers", () => {
    it("resolveBaseUrl handles custom and default values", () => {
      expect(resolveBaseUrl("https://custom.pepkio.com/")).toBe(
        "https://custom.pepkio.com",
      );
      expect(resolveBaseUrl()).toBe(DEFAULT_API_BASE_URL);
    });

    it("resolveApiKey prefers explicit key, then LOCAL vs production", () => {
      expect(resolveApiKey("https://tools.localtest.me", "my-key")).toBe("my-key");
      const savedProd = process.env.PEPKIO_API_KEY;
      const savedLocal = process.env.LOCAL_PEPKIO_API_KEY;
      try {
        process.env.PEPKIO_API_KEY = "prod-env-key";
        process.env.LOCAL_PEPKIO_API_KEY = "local-env-key";

        expect(resolveApiKey("https://tools.localtest.me")).toBe("local-env-key");
        expect(resolveApiKey("https://tools.pepkio.com")).toBe("prod-env-key");
      } finally {
        process.env.PEPKIO_API_KEY = savedProd;
        process.env.LOCAL_PEPKIO_API_KEY = savedLocal;
      }
    });

    it("apiPath builds correct URLs", () => {
      expect(apiPath("https://tools.pepkio.com", "/tools/biostat-test-navigator/run")).toBe(
        "https://tools.pepkio.com/api/tools/v1/tools/biostat-test-navigator/run",
      );
      expect(apiPath("https://tools.pepkio.com", "runs/123")).toBe(
        "https://tools.pepkio.com/api/tools/v1/runs/123",
      );
    });
  });

  describe("schema parsing", () => {
    it("validates valid inputs", () => {
      const parsed = parseRunInput({
        template_id: "qpcr",
        outcome_type: "continuous",
        comparison_type: "two_groups",
        group_count: 2,
        groups: [
          { name: "Control", values: [1.0, 2.0] },
          { name: "Treatment", values: [3.0, 4.0] },
        ],
      });
      expect(parsed.template_id).toBe("qpcr");
      expect(parsed.comparison_type).toBe("two_groups");
      expect(parsed.groups?.[0]?.name).toBe("Control");
    });

    it("throws on invalid outcome_type", () => {
      expect(() => parseRunInput({ outcome_type: "invalid_type" })).toThrow();
    });

    it("throws on invalid group_count below minimum", () => {
      expect(() => parseRunInput({ group_count: 1 })).toThrow();
    });
  });
});
