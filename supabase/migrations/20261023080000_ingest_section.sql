-- Stores one section of one day's content atomically and records the run.
-- Re-sending a section for the same date replaces it, so retries are idempotent.
-- Item keys must match the target table's column names (snake_case); the Edge Function maps them.
create function public.ingest_section(p_section text, p_digest_date date, p_items jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_run_id uuid;
  v_count integer;
begin
  if jsonb_typeof(p_items) is distinct from 'array' then
    raise exception 'items must be a JSON array';
  end if;
  v_count := jsonb_array_length(p_items);

  insert into public.ingestion_runs (section, digest_date, status, items_count)
  values (p_section, p_digest_date, 'succeeded', v_count)
  returning id into v_run_id;

  if p_section = 'interview' then
    if v_count <> 1 then
      raise exception 'interview expects exactly one item, got %', v_count;
    end if;

    insert into public.daily_interview_questions (
      digest_date, topic, difficulty, question, answer, answer_origin,
      source_repository, source_url, ingestion_run_id
    )
    select p_digest_date, i.topic, i.difficulty, i.question, i.answer, i.answer_origin,
           i.source_repository, i.source_url, v_run_id
    from jsonb_populate_record(null::public.daily_interview_questions, p_items -> 0) as i
    on conflict (digest_date) do update set
      topic = excluded.topic,
      difficulty = excluded.difficulty,
      question = excluded.question,
      answer = excluded.answer,
      answer_origin = excluded.answer_origin,
      source_repository = excluded.source_repository,
      source_url = excluded.source_url,
      ingestion_run_id = excluded.ingestion_run_id;

  elsif p_section = 'news' then
    delete from public.news_items where digest_date = p_digest_date;

    insert into public.news_items (
      digest_date, position, title, url, publisher, category, summary,
      published_at, content_hash, ingestion_run_id
    )
    select p_digest_date, (e.ord - 1)::smallint, i.title, i.url, i.publisher, i.category, i.summary,
           i.published_at,
           encode(sha256(convert_to(i.url || E'\n' || i.title || E'\n' || i.summary, 'UTF8')), 'hex'),
           v_run_id
    from jsonb_array_elements(p_items) with ordinality as e(item, ord)
    cross join lateral jsonb_populate_record(null::public.news_items, e.item) as i;

  elsif p_section = 'de_topic' then
    if v_count <> 1 then
      raise exception 'de_topic expects exactly one item, got %', v_count;
    end if;

    insert into public.de_topics (
      digest_date, title, explanation, practical_example, reference_urls, ingestion_run_id
    )
    select p_digest_date, i.title, i.explanation, i.practical_example,
           coalesce(i.reference_urls, '{}'), v_run_id
    from jsonb_populate_record(null::public.de_topics, p_items -> 0) as i
    on conflict (digest_date) do update set
      title = excluded.title,
      explanation = excluded.explanation,
      practical_example = excluded.practical_example,
      reference_urls = excluded.reference_urls,
      ingestion_run_id = excluded.ingestion_run_id;

  elsif p_section = 'trending' then
    delete from public.trending_repos where digest_date = p_digest_date;

    insert into public.trending_repos (
      digest_date, rank, full_name, url, description, language, stars, ingestion_run_id
    )
    select p_digest_date, e.ord::smallint, i.full_name, i.url, i.description, i.language, i.stars, v_run_id
    from jsonb_array_elements(p_items) with ordinality as e(item, ord)
    cross join lateral jsonb_populate_record(null::public.trending_repos, e.item) as i;

  else
    raise exception 'unknown section: %', p_section;
  end if;

  return jsonb_build_object('run_id', v_run_id, 'count', v_count);
end;
$$;

revoke execute on function public.ingest_section(text, date, jsonb) from public, anon, authenticated;
grant execute on function public.ingest_section(text, date, jsonb) to service_role;
