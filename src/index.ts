import dotenv from "dotenv";
import { SQL, and, asc, desc, eq, like, or } from "drizzle-orm";
import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import { codesTable } from "./db/schema";
import { zSearchParams, zSubmissionParams } from "./ztypes";
import { setupRedis } from "./db/redis";
import getDB from "./db/db";

async function main() {
  dotenv.config();

  const app: Express = express();
  const port = process.env.PORT || 3000;
  const db = await getDB();

  app.use(express.json());
  app.use(cors());

  const redisClient = await setupRedis();

  app.post("/api/submissions", async (req: Request, res: Response) => {
    const params = zSubmissionParams.safeParse(req.body);
    if (params.success) {
      const submission = params.data;

      try {
        await db
          .insert(codesTable)
          .values({ ...submission, status: "api_failure" });

        redisClient.flushAll();
        res.json({ success: true });
        return;
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: "DB Error" });
        return;
      }
    } else {
      res.status(400).send(params.error);
      return;
    }
  });

  const checkCache = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const cachedData = await redisClient.get(req.url);

    if (cachedData) {
      res.send(JSON.parse(cachedData));
    } else {
      next(); // Continue to the route handler if data is not in the cache
    }
  };

  app.get(
    "/api/submissions",
    checkCache,
    async (req: Request, res: Response) => {
      const conditions: SQL[] = [];
      let perPage = 10;
      let page = 1;
      let orderBy = desc(codesTable.timestamp);

      try {
        const params = zSearchParams.parse(req.query);
        perPage = params.page_size;
        page = params.page;

        switch (params.sortBy) {
          case "language_asc":
            orderBy = asc(codesTable.language);
            break;
          case "language_dsc":
            orderBy = desc(codesTable.language);
            break;
          case "timestamp_asc":
            orderBy = asc(codesTable.timestamp);
            break;
          case "timestamp_dsc":
            orderBy = desc(codesTable.timestamp);
            break;
          case "username_asc":
            orderBy = asc(codesTable.username);
            break;
          case "username_dsc":
            orderBy = desc(codesTable.username);
            break;
          default:
            break;
        }

        if (params.username) {
          conditions.push(like(codesTable.username, `%${params.username}%`));
        }

        if (params.language) {
          conditions.push(
            or(
              ...params.language.map((language) =>
                eq(codesTable.language, language)
              )
            )!
          );
        }

        if (params.status) {
          conditions.push(
            or(...params.status.map((status) => eq(codesTable.status, status)))!
          );
        }
      } catch (error) {
        console.log(error);
      }

      try {
        const dbres = await db
          .select()
          .from(codesTable)
          .where(and(...conditions))
          .limit(perPage)
          .offset((page - 1) * perPage)
          .orderBy(orderBy);

        await redisClient.set(req.url, JSON.stringify(dbres));
        res.json(dbres);
        return;
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: "DB Error" });
        return;
      }
    }
  );

  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}

main();
