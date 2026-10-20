import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // Stable Sites identity ID
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  authProvider: text("auth_provider").notNull().default("chatgpt"),
  role: text("role").notNull().default("USER"),
  status: text("status").notNull().default("ACTIVE"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const resumes = sqliteTable("resumes", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  kind: text("kind").notNull().default("resume"),
  company: text("company").notNull().default(""),
  jobDescription: text("job_description").notNull().default(""),
  templateConfigJson: text("template_config_json").notNull().default("{}"),
  bulletsJson: text("bullets_json").notNull().default("[]"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const userProfiles = sqliteTable("user_profiles", {
  userId: text("user_id").primaryKey().references(() => users.id),
  nextGoal: text("next_goal").notNull().default("Land a new job in the same career path"),
  targetTitle: text("target_title").notNull().default("General Manager"),
  targetDate: text("target_date").notNull().default("July 2024"),
  salaryRange: text("salary_range").notNull().default("$51,000 to $75,000"),
  onboardingJson: text("onboarding_json").notNull().default("[]"),
  lessonDone: integer("lesson_done", { mode: "boolean" }).notNull().default(false),
  hasCompletedTour: integer("has_completed_tour", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const jobApplications = sqliteTable("job_applications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  company: text("company").notNull().default(""),
  location: text("location").notNull().default(""),
  status: text("status").notNull().default("Saved"),
  url: text("url").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const cmsResources = sqliteTable("cms_resources", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  resourceType: text("resource_type").notNull().default("link"),
  articleContent: text("article_content").notNull().default(""),
  templateConfigJson: text("template_config_json").notNull().default("{}"),
  columnNo: integer("column_no").notNull().default(1),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const graderSettings = sqliteTable("grader_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const resumeMatchScores = sqliteTable("resume_match_scores", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  resumeId: text("resume_id").notNull().references(() => resumes.id),
  score: integer("score").notNull(),
  title: text("title").notNull().default(""),
  company: text("company").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, table => ({ resumeUnique: uniqueIndex("resume_match_scores_resume_unique").on(table.resumeId) }));

export const companies = sqliteTable('companies', {
  id:text('id').primaryKey(), userId:text('user_id').notNull().references(()=>users.id),
  name:text('name').notNull(), website:text('website').notNull().default(''), industry:text('industry').notNull().default(''),
  location:text('location').notNull().default(''), status:text('status').notNull().default('Researching'), notes:text('notes').notNull().default(''),
  createdAt:text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`), updatedAt:text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});
export const contacts = sqliteTable('contacts', {
  id:text('id').primaryKey(), userId:text('user_id').notNull().references(()=>users.id),
  companyId:text('company_id').references(()=>companies.id,{onDelete:'set null'}), name:text('name').notNull(), role:text('role').notNull().default(''),
  email:text('email').notNull().default(''), url:text('url').notNull().default(''), relationship:text('relationship').notNull().default('Recruiter'),
  notes:text('notes').notNull().default(''), followUp:text('follow_up').notNull().default(''),
  createdAt:text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`), updatedAt:text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});
export const applicationWorkspace = sqliteTable('application_workspace', {
  jobId:text('job_id').primaryKey().references(()=>jobApplications.id,{onDelete:'cascade'}), userId:text('user_id').notNull().references(()=>users.id),
  companyId:text('company_id').references(()=>companies.id,{onDelete:'set null'}), contactId:text('contact_id').references(()=>contacts.id,{onDelete:'set null'}),
  resumeId:text('resume_id').references(()=>resumes.id,{onDelete:'set null'}), coverLetterId:text('cover_letter_id').references(()=>resumes.id,{onDelete:'set null'}),
  jobDescription:text('job_description').notNull().default(''), interviewNotes:text('interview_notes').notNull().default(''), followUp:text('follow_up').notNull().default(''),
  submittedJson:text('submitted_json').notNull().default('{}'), activityJson:text('activity_json').notNull().default('[]'),
  updatedAt:text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});
export const resumeVersions = sqliteTable('resume_versions', {
  id:text('id').primaryKey(), userId:text('user_id').notNull().references(()=>users.id), resumeId:text('resume_id').notNull().references(()=>resumes.id,{onDelete:'cascade'}),
  label:text('label').notNull(), snapshotJson:text('snapshot_json').notNull(), createdAt:text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const chatSessions = sqliteTable('chat_sessions', {
 id:text('id').primaryKey(),userId:text('user_id').notNull().references(()=>users.id),title:text('title').notNull(),
 busyUntil:integer('busy_until').notNull().default(0),createdAt:text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),updatedAt:text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});
export const chatMessages = sqliteTable('chat_messages', {
 id:text('id').primaryKey(),sessionId:text('session_id').notNull().references(()=>chatSessions.id,{onDelete:'cascade'}),
 role:text('role').notNull(),content:text('content').notNull(),status:text('status').notNull().default('complete'),contextLabel:text('context_label').notNull().default(''),createdAt:text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});
export const aiSettings = sqliteTable('ai_settings', {key:text('key').primaryKey(),value:text('value').notNull(),updatedAt:text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)});
export const usageLimits = sqliteTable('usage_limits', {key:text('key').primaryKey(),count:integer('count').notNull().default(0),expiresAt:integer('expires_at').notNull()});
export const feedCache = sqliteTable('feed_cache', {key:text('key').primaryKey(),payload:text('payload').notNull(),fetchedAt:integer('fetched_at').notNull()});
