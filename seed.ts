import "dotenv/config";
import fs from "fs/promises";
import { Client } from "pg";

async function main() {
	const client = new Client({
		user: process.env.DB_USER!,
		host: process.env.DB_HOST!,
		database: process.env.DB_NAME!,
		password: process.env.DB_PASSWORD!,
		port: Number(process.env.DB_PORT!),
	});

	console.log("connecting to db");
	await client.connect();

	try {
		console.log("creating tables");
		const sql = await fs.readFile("sql/create.sql", "utf8");

		await client.query(sql);
		console.log("tables created");
	} catch (error) {
		console.error(error);
	} finally {
		console.log("disconnecting from db");
		await client.end();
	}
}

main()
