import * as schema from "./schema";
import { MySql2Database, drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

let db: MySql2Database<typeof schema>;

export default async function getDB() {
  if (!db) {
    const connection = await mysql.createConnection({
      uri: process.env.DBCS,
    });
    db = drizzle(connection, { schema, mode: "default" });
  }
  return db;
}
