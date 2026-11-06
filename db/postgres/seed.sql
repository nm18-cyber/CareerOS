-- Starter content (resource hub + grader thresholds) for a fresh CareerOS database.
-- Converted from the INSERT OR IGNORE seeds in drizzle/0000 and 0001. Safe to re-run.

INSERT INTO cms_resources (id,slug,title,description,category,column_no,published) VALUES
('res-career-hub','career-hub','Career Hub','Practical strategies for your next move.','Career Hub',1,1),
('res-tech-jobs','tech-job-board','Tech Job Board','Roles worth your attention.','Jobs',1,1),
('res-cover-templates','cover-letter-templates','Cover Letter Templates','Strong starts for every application.','Templates',1,1),
('res-resume-hub','resume-hub','Resume Hub','A clear guide to better resumes.','Guides',1,1),
('res-resume-examples','resume-examples','Resume Examples','Role-specific examples to learn from.','Examples',2,1),
('res-resume-templates','resume-templates','Resume Templates','Layouts made for readable resumes.','Templates',2,1),
('res-synonyms','resume-synonyms','Resume Synonyms','Sharper words for your experience.','Tools',2,1),
('res-cover-examples','cover-letter-examples','Cover Letter Examples','Examples for different roles and goals.','Examples',3,1),
('res-cv-examples','cv-examples','CV Examples','Formats for academic and global CVs.','Examples',3,1),
('res-career-paths','career-paths','Career Paths','Explore role guides and possible next steps.','Guides',3,1)
ON CONFLICT DO NOTHING;

INSERT INTO grader_settings (key,value) VALUES ('thresholds','{"metricWeight":40,"actionWeight":30,"keywordWeight":30}')
ON CONFLICT DO NOTHING;

INSERT INTO cms_resources (id,slug,title,description,category,resource_type,template_config_json,column_no,published) VALUES
('tpl-clean','template-clean-professional','Clean Professional','Single-column, ATS-friendly resume for business roles.','Resume', 'template','{"accent":"#004d40","layout":"single-column","sections":["Summary","Experience","Education","Skills"]}',1,1),
('tpl-modern','template-modern-technical','Modern Technical','Compact skills-first layout for engineering and product roles.','Resume', 'template','{"accent":"#004d40","layout":"skills-first","sections":["Summary","Skills","Experience","Projects","Education"]}',1,1),
('tpl-creative','template-creative-marketing','Creative Marketing','Editorial hierarchy for brand, marketing, and communications roles.','Resume', 'template','{"accent":"#9a6a13","layout":"editorial","sections":["Profile","Experience","Selected Work","Education"]}',1,1),
('tpl-cover','template-cover-letter','Business Cover Letter','Clear business letter layout with editable recipient and sign-off blocks.','Cover Letter', 'template','{"accent":"#004d40","layout":"letter","sections":["Sender","Recipient","Opening","Body","Sign-off"]}',1,1)
ON CONFLICT DO NOTHING;

