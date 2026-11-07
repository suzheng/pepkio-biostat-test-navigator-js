// SPDX-License-Identifier: MIT
import { PepkioClient, PepkioAPIError } from "../dist/index.js";

async function main() {
  // Client with missing or invalid credentials
  const client = new PepkioClient({ apiKey: "" });

  try {
    await client.run({
      outcome_type: "continuous",
      comparison_type: "two_groups",
    });
  } catch (err) {
    if (err instanceof PepkioAPIError) {
      console.log(`Caught expected PepkioAPIError:`);
      console.log(`- Status: ${err.status}`);
      console.log(`- Message: ${err.message}`);
    } else {
      throw err;
    }
  }
}

main().catch(console.error);
