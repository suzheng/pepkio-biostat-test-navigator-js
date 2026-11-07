// SPDX-License-Identifier: MIT
import { PepkioClient } from "../dist/index.js";

async function main() {
  const apiKey =
    process.env.PEPKIO_API_KEY ||
    process.env.LOCAL_PEPKIO_API_KEY ||
    "your-api-key";

  const client = new PepkioClient({ apiKey });

  console.log("Analyzing 3-group experiment with automated assumption checks...");
  const result = await client.compareGroups(
    [
      { name: "Control", values: [12.1, 11.8, 12.5, 11.9, 12.2] },
      { name: "Low Dose", values: [15.4, 14.8, 15.1, 16.0, 14.9] },
      { name: "High Dose", values: [22.3, 21.9, 23.1, 22.0, 22.8] },
    ],
    {
      templateId: "custom",
      postHocIntent: "vs_control",
      controlGroup: "Control",
    },
  );

  console.log(`Status: ${result.status}`);
  console.log(`Primary Test: ${result.result?.primary_test}`);
  console.log(`Post-hoc Test: ${result.result?.post_hoc_test}`);
  console.log(`Methods Paragraph:\n${result.result?.methods_paragraph}`);

  if (result.result?.code_python) {
    console.log("\nGenerated Python Script:\n");
    console.log(result.result.code_python);
  }
}

main().catch(console.error);
