-- TechPilot v1: daily content tables, read-only for the public dashboard.
-- Content is written only by the ingestion Edge Function (service role).

-- Objects created in public are no longer exposed to API roles unless granted explicitly.
alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke usage, select on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- Audit log of every ingestion call, successful or not. Not exposed to the dashboard.
create table public.ingestion_runs (
  id           uuid primary key default gen_random_uuid(),
  section      text not null check (section in ('interview', 'news', 'de_topic', 'trending')),
  digest_date  date not null,
  status       text not null check (status in ('succeeded', 'failed')),
  items_count  integer not null default 0 check (items_count >= 0),
  error        jsonb,
  received_at  timestamptz not null default now()
);
create index ingestion_runs_section_date_idx on public.ingestion_runs (section, digest_date desc);

create table public.daily_interview_questions (
  digest_date        date primary key,
  topic              text not null check (char_length(topic) between 1 and 100),
  difficulty         text check (difficulty in ('easy', 'medium', 'hard')),
  question           text not null check (char_length(question) between 1 and 2000),
  answer             text not null check (char_length(answer) between 1 and 20000),
  answer_origin      text not null
                     check (answer_origin in ('repository', 'ai_generated', 'repository_ai_enhanced')),
  -- Kept for traceability; not shown in the UI.
  source_repository  text not null check (char_length(source_repository) between 1 and 200),
  source_url         text not null check (source_url ~ '^https://'),
  ingestion_run_id   uuid references public.ingestion_runs (id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table public.news_items (
  id                uuid primary key default gen_random_uuid(),
  digest_date       date not null,
  position          smallint not null check (position >= 0),
  title             text not null check (char_length(title) between 1 and 300),
  url               text not null check (url ~ '^https?://'),
  publisher         text not null check (char_length(publisher) between 1 and 120),
  category          text not null
                    check (category in ('ai', 'data_engineering', 'cloud', 'technology', 'careers')),
  summary           text not null check (char_length(summary) between 1 and 2000),
  published_at      timestamptz not null,
  content_hash      text not null,
  ingestion_run_id  uuid references public.ingestion_runs (id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (digest_date, position),
  unique (digest_date, url)
);

create table public.de_topics (
  digest_date        date primary key,
  title              text not null check (char_length(title) between 1 and 200),
  explanation        text not null check (char_length(explanation) between 1 and 10000),
  practical_example  text not null check (char_length(practical_example) between 1 and 10000),
  reference_urls     text[] not null default '{}' check (cardinality(reference_urls) <= 10),
  ingestion_run_id   uuid references public.ingestion_runs (id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table public.trending_repos (
  digest_date       date not null,
  rank              smallint not null check (rank between 1 and 100),
  full_name         text not null check (full_name ~ '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$'),
  url               text not null check (url ~ '^https://github\.com/'),
  description       text check (char_length(description) <= 1000),
  language          text check (char_length(language) <= 60),
  stars             integer not null check (stars >= 0),
  ingestion_run_id  uuid references public.ingestion_runs (id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  primary key (digest_date, rank),
  unique (digest_date, full_name)
);

create trigger set_updated_at before update on public.daily_interview_questions
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.news_items
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.de_topics
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.trending_repos
  for each row execute function public.set_updated_at();

-- Every date that has at least one section, used for the date picker range.
create view public.digest_dates
with (security_invoker = true)
as
  select digest_date from public.daily_interview_questions
  union
  select digest_date from public.news_items
  union
  select digest_date from public.de_topics
  union
  select digest_date from public.trending_repos;

-- Row level security: anyone may read content; nobody may write through the API.
alter table public.ingestion_runs enable row level security;
alter table public.daily_interview_questions enable row level security;
alter table public.news_items enable row level security;
alter table public.de_topics enable row level security;
alter table public.trending_repos enable row level security;

create policy "Content is publicly readable" on public.daily_interview_questions
  for select to anon, authenticated using (true);
create policy "Content is publicly readable" on public.news_items
  for select to anon, authenticated using (true);
create policy "Content is publicly readable" on public.de_topics
  for select to anon, authenticated using (true);
create policy "Content is publicly readable" on public.trending_repos
  for select to anon, authenticated using (true);

revoke all on table
  public.ingestion_runs,
  public.daily_interview_questions,
  public.news_items,
  public.de_topics,
  public.trending_repos,
  public.digest_dates
from anon, authenticated;

grant select on table
  public.daily_interview_questions,
  public.news_items,
  public.de_topics,
  public.trending_repos,
  public.digest_dates
to anon, authenticated;

grant select, insert, update, delete on table
  public.ingestion_runs,
  public.daily_interview_questions,
  public.news_items,
  public.de_topics,
  public.trending_repos
to service_role;
grant select on table public.digest_dates to service_role;
