import { Language, Status } from "@/ztypes";
import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/mysql-core";

export const codesTable = mysqlTable("codes", {
  id: serial("id").primaryKey().notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  username: varchar("username", { length: 256 }).notNull(),
  language: varchar("language", { length: 20 }).notNull().$type<Language>(),
  stdin: text("stdin").default("").notNull(),
  code: text("code").default("").notNull(),
  stdout: text("stdout").default("").notNull(),
  status: varchar("status", { length: 32 }).notNull().$type<Status>(),
});
