import { describe, expect, it } from "vitest";
import { PepkioClient } from "../src/client.js";
import { TOOL_ID } from "../src/config.js";

const LOCAL_BASE_URL = "https://tools.localtest.me";
const PRODUCTION_BASE_URL = "https://tools.pepkio.com";

function envConfig(env: "local" | "production") {
  const baseUrl = process.env.PEPKIO_API_BASE_URL
    ? process.env.PEPKIO_API_BASE_URL.replace(/\/$/, "")
    : env === "local"
      ? LOCAL_BASE_URL
      : PRODUCTION_BASE_URL;

  const isLocal = baseUrl.includes("localtest.me");
  const apiKey = isLocal
    ? process.env.LOCAL_PEPKIO_API_KEY ?? process.env.PEPKIO_API_KEY
    : process.env.PEPKIO_API_KEY;

  return { baseUrl, apiKey, isLocal };
}

describe("integration: local", () => {
  const { baseUrl, apiKey } = envConfig("local");

  it.skipIf(!apiKey)("fetches manifest", async () => {
    const client = new PepkioClient({ baseUrl, apiKey });
    const manifest = await client.getManifest();

    expect(manifest.tool_id).toBe(TOOL_ID);
    expect(manifest.title).toBe("Biostat Test Navigator");
    const names = manifest.examples?.map((e) => e.name) ?? [];
    expect(names).toContain("qpcr_two_group_mann_whitney");
    expect(names).toContain("survival_log_rank");
    expect(names).toContain("categorical_fisher_small_cells");
  });

  it.skipIf(!apiKey)("runs qpcr_two_group_mann_whitney example", async () => {
    const client = new PepkioClient({ baseUrl, apiKey });
    const input = await client.getExampleInput("qpcr_two_group_mann_whitney");
    const result = await client.run(input);

    expect(result.status).toBe("completed");
    expect(result.error).toBeFalsy();
    expect(result.result?.ready).toBe(true);
    expect(result.result?.primary_test).toBeDefined();
    expect(result.result?.primary_test_key).toBe("mann_whitney");
  }, 60_000);

  it.skipIf(!apiKey)("runs survival_log_rank example", async () => {
    const client = new PepkioClient({ baseUrl, apiKey });
    const input = await client.getExampleInput("survival_log_rank");
    const result = await client.run(input);

    expect(result.status).toBe("completed");
    expect(result.error).toBeFalsy();
    expect(result.result?.ready).toBe(true);
    expect(result.result?.primary_test_key).toBe("log_rank");
  }, 60_000);

  it.skipIf(!apiKey)("runs categorical_fisher_small_cells example", async () => {
    const client = new PepkioClient({ baseUrl, apiKey });
    const input = await client.getExampleInput("categorical_fisher_small_cells");
    const result = await client.run(input);

    expect(result.status).toBe("completed");
    expect(result.error).toBeFalsy();
    expect(result.result?.ready).toBe(true);
    expect(result.result?.primary_test_key).toBe("fisher_exact");
  }, 60_000);

  it.skipIf(!apiKey)("runs compareGroups convenience helper with continuous data", async () => {
    const client = new PepkioClient({ baseUrl, apiKey });
    const result = await client.compareGroups([
      { name: "Vehicle", values: [1.2, 1.1, 1.3, 1.15, 1.25] },
      { name: "Inhibitor", values: [0.4, 0.45, 0.38, 0.42, 0.5] },
    ], {
      templateId: "qpcr",
    });

    expect(result.status).toBe("completed");
    expect(result.error).toBeFalsy();
    expect(result.result?.ready).toBe(true);
    expect(result.result?.primary_test).toBeDefined();
    expect(result.result?.code_python).toBeDefined();
  }, 60_000);
});

describe("integration: production", () => {
  const { baseUrl, apiKey } = envConfig("production");

  it.skipIf(!apiKey || baseUrl.includes("localtest.me"))(
    "fetches manifest",
    async () => {
      const client = new PepkioClient({
        baseUrl: PRODUCTION_BASE_URL,
        apiKey,
      });
      const manifest = await client.getManifest();

      expect(manifest.tool_id).toBe(TOOL_ID);
      expect(manifest.title).toBe("Biostat Test Navigator");
      const names = manifest.examples?.map((e) => e.name) ?? [];
      expect(names).toContain("qpcr_two_group_mann_whitney");
      expect(names).toContain("survival_log_rank");
      expect(names).toContain("categorical_fisher_small_cells");
    },
  );

  it.skipIf(!apiKey || baseUrl.includes("localtest.me"))(
    "runs qpcr_two_group_mann_whitney example",
    async () => {
      const client = new PepkioClient({
        baseUrl: PRODUCTION_BASE_URL,
        apiKey,
      });
      const input = await client.getExampleInput("qpcr_two_group_mann_whitney");
      const result = await client.run(input);

      expect(result.status).toBe("completed");
      expect(result.error).toBeFalsy();
      expect(result.result?.ready).toBe(true);
      expect(result.result?.primary_test).toBeDefined();
      expect(result.result?.primary_test_key).toBe("mann_whitney");
    },
    60_000,
  );

  it.skipIf(!apiKey || baseUrl.includes("localtest.me"))(
    "runs survival_log_rank example",
    async () => {
      const client = new PepkioClient({
        baseUrl: PRODUCTION_BASE_URL,
        apiKey,
      });
      const input = await client.getExampleInput("survival_log_rank");
      const result = await client.run(input);

      expect(result.status).toBe("completed");
      expect(result.error).toBeFalsy();
      expect(result.result?.ready).toBe(true);
      expect(result.result?.primary_test_key).toBe("log_rank");
    },
    60_000,
  );

  it.skipIf(!apiKey || baseUrl.includes("localtest.me"))(
    "runs categorical_fisher_small_cells example",
    async () => {
      const client = new PepkioClient({
        baseUrl: PRODUCTION_BASE_URL,
        apiKey,
      });
      const input = await client.getExampleInput("categorical_fisher_small_cells");
      const result = await client.run(input);

      expect(result.status).toBe("completed");
      expect(result.error).toBeFalsy();
      expect(result.result?.ready).toBe(true);
      expect(result.result?.primary_test_key).toBe("fisher_exact");
    },
    60_000,
  );

  it.skipIf(!apiKey || baseUrl.includes("localtest.me"))(
    "runs compareGroups convenience helper with continuous data",
    async () => {
      const client = new PepkioClient({
        baseUrl: PRODUCTION_BASE_URL,
        apiKey,
      });
      const result = await client.compareGroups([
        { name: "Vehicle", values: [1.2, 1.1, 1.3, 1.15, 1.25] },
        { name: "Inhibitor", values: [0.4, 0.45, 0.38, 0.42, 0.5] },
      ], {
        templateId: "qpcr",
      });

      expect(result.status).toBe("completed");
      expect(result.error).toBeFalsy();
      expect(result.result?.ready).toBe(true);
      expect(result.result?.primary_test).toBeDefined();
      expect(result.result?.code_python).toBeDefined();
    },
    60_000,
  );
});
