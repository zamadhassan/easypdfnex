alter table blog_posts
add column if not exists related_tools jsonb not null default '[]'::jsonb;
