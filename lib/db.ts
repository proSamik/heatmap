import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import { pgTable, serial, text, integer, date, timestamp, boolean, jsonb } from "drizzle-orm/pg-core"

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)

export const githubContributions = pgTable("github_contributions", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  count: integer("count").notNull().default(0),
  details: jsonb("details").$type<{ repos: string[]; commits: { repo: string; message: string }[] }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const youtubeUploads = pgTable("youtube_uploads", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  count: integer("count").notNull().default(0),
  videoIds: text("video_ids").array(),
  details: jsonb("details").$type<{ videos: { id: string; title: string; thumbnail: string }[] }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const syncStatus = pgTable("sync_status", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  lastSyncDate: date("last_sync_date").notNull(),
  isInitialized: boolean("is_initialized").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
})
