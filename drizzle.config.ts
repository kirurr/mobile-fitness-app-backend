import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { generateDBString } from "./src/lib/utils.ts";


export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: generateDBString(),
  },
});
