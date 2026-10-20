CREATE TABLE `cms_resources` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`column_no` integer DEFAULT 1 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cms_resources_slug_unique` ON `cms_resources` (`slug`);--> statement-breakpoint
CREATE TABLE `grader_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text,
	`auth_provider` text DEFAULT 'chatgpt' NOT NULL,
	`role` text DEFAULT 'USER' NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `resumes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`company` text DEFAULT '' NOT NULL,
	`bullets_json` text DEFAULT '[]' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT OR IGNORE INTO cms_resources (id,slug,title,description,category,column_no,published) VALUES
('res-career-hub','career-hub','Career Hub','Practical strategies for your next move.','Career Hub',1,1),
('res-tech-jobs','tech-job-board','Tech Job Board','Roles worth your attention.','Jobs',1,1),
('res-cover-templates','cover-letter-templates','Cover Letter Templates','Strong starts for every application.','Templates',1,1),
('res-resume-hub','resume-hub','Resume Hub','A clear guide to better resumes.','Guides',1,1),
('res-resume-examples','resume-examples','Resume Examples','Role-specific examples to learn from.','Examples',2,1),
('res-resume-templates','resume-templates','Resume Templates','Layouts made for readable resumes.','Templates',2,1),
('res-synonyms','resume-synonyms','Resume Synonyms','Sharper words for your experience.','Tools',2,1),
('res-cover-examples','cover-letter-examples','Cover Letter Examples','Examples for different roles and goals.','Examples',3,1),
('res-cv-examples','cv-examples','CV Examples','Formats for academic and global CVs.','Examples',3,1),
('res-career-paths','career-paths','Career Paths','Explore role guides and possible next steps.','Guides',3,1);
--> statement-breakpoint
INSERT OR IGNORE INTO grader_settings (key,value) VALUES ('thresholds','{"metricWeight":40,"actionWeight":30,"keywordWeight":30}');
