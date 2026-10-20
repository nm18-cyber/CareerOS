CREATE TABLE `job_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`company` text DEFAULT '' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Saved' NOT NULL,
	`url` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`next_goal` text DEFAULT 'Land a new job in the same career path' NOT NULL,
	`target_title` text DEFAULT 'General Manager' NOT NULL,
	`target_date` text DEFAULT 'July 2024' NOT NULL,
	`salary_range` text DEFAULT '$51,000 to $75,000' NOT NULL,
	`onboarding_json` text DEFAULT '[]' NOT NULL,
	`lesson_done` integer DEFAULT false NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `cms_resources` ADD `resource_type` text DEFAULT 'link' NOT NULL;--> statement-breakpoint
ALTER TABLE `cms_resources` ADD `article_content` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `cms_resources` ADD `template_config_json` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `resumes` ADD `kind` text DEFAULT 'resume' NOT NULL;--> statement-breakpoint
ALTER TABLE `resumes` ADD `job_description` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `resumes` ADD `template_config_json` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
INSERT OR IGNORE INTO cms_resources (id,slug,title,description,category,resource_type,template_config_json,column_no,published) VALUES
('tpl-clean','template-clean-professional','Clean Professional','Single-column, ATS-friendly resume for business roles.','Resume', 'template','{"accent":"#004d40","layout":"single-column","sections":["Summary","Experience","Education","Skills"]}',1,1),
('tpl-modern','template-modern-technical','Modern Technical','Compact skills-first layout for engineering and product roles.','Resume', 'template','{"accent":"#004d40","layout":"skills-first","sections":["Summary","Skills","Experience","Projects","Education"]}',1,1),
('tpl-creative','template-creative-marketing','Creative Marketing','Editorial hierarchy for brand, marketing, and communications roles.','Resume', 'template','{"accent":"#9a6a13","layout":"editorial","sections":["Profile","Experience","Selected Work","Education"]}',1,1),
('tpl-cover','template-cover-letter','Business Cover Letter','Clear business letter layout with editable recipient and sign-off blocks.','Cover Letter', 'template','{"accent":"#004d40","layout":"letter","sections":["Sender","Recipient","Opening","Body","Sign-off"]}',1,1);
