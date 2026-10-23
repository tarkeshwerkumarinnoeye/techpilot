-- Supabase's auto-enable-RLS event trigger function only needs to run as an event trigger.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- Cover the ingestion_run_id foreign keys so deleting old runs stays cheap.
create index daily_interview_questions_ingestion_run_id_idx
  on public.daily_interview_questions (ingestion_run_id);
create index news_items_ingestion_run_id_idx on public.news_items (ingestion_run_id);
create index de_topics_ingestion_run_id_idx on public.de_topics (ingestion_run_id);
create index trending_repos_ingestion_run_id_idx on public.trending_repos (ingestion_run_id);
