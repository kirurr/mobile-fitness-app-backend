import { drizzle } from "drizzle-orm/node-postgres";
import { generateDBString } from "../lib/utils.js";

export const db = drizzle(generateDBString());
