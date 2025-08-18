-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";
create extension if not exists "vector";

-- Helper: updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Helper: current user id (no table deps)
create or replace function public.current_user_id()
returns uuid
stable
language sql
as $$
  select auth.uid();
$$;

-- Tables
create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.members (
  user_id uuid not null,
  org_id uuid not null references public.orgs(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(user_id, org_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  type text not null,
  name text not null,
  status text not null default 'disconnected',
  last_sync_at timestamptz,
  error text,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  source_id uuid references public.sources(id) on delete set null,
  title text,
  path text,
  raw_text text,
  tokens int,
  pii_flags text[] default '{}'::text[],
  status text not null default 'ready',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chunks (
  id bigserial primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  embedding vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pipelines (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  index_name text,
  reranker text,
  guardrails text[] default '{}'::text[],
  config jsonb not null default '{}'::jsonb,
  last_deploy_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.eval_sets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  domain text,
  items int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.eval_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  eval_set_id uuid references public.eval_sets(id) on delete set null,
  model text,
  pipeline_id uuid references public.pipelines(id) on delete set null,
  accuracy numeric,
  hallucination_rate numeric,
  toxicity numeric,
  cost_usd numeric,
  duration_ms int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.policies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  pii_redaction boolean default false,
  allowed_sources text[] default '{}'::text[],
  profanity_level text default 'medium',
  updated_at timestamptz default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigserial primary key,
  project_id uuid references public.projects(id) on delete cascade,
  actor uuid,
  event_type text not null,
  target text,
  diff jsonb,
  created_at timestamptz default now()
);

-- Dependent helper functions
create or replace function public.is_project_member(p_id uuid)
returns boolean
stable
language sql
as $$
  select exists (
    select 1
    from public.projects p
    join public.orgs o on o.id = p.org_id
    join public.members m on m.org_id = o.id
    where p.id = p_id
      and m.user_id = auth.uid()
  );
$$;

create or replace function public.match_chunks(
  p_project_id uuid,
  p_query_embedding vector,
  p_match_count int
) returns table (
  chunk_id bigint,
  content text,
  score real,
  document_id uuid
) language sql stable as $$
  select c.id as chunk_id,
         c.content,
         1 - (c.embedding <=> p_query_embedding) as score,
         c.document_id
  from public.chunks c
  where c.project_id = p_project_id
  order by c.embedding <=> p_query_embedding
  limit p_match_count
$$;

-- Indexes
create index if not exists chunks_embedding_ivfflat on public.chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists chunks_project_doc_idx on public.chunks(project_id, document_id, chunk_index);
create index if not exists documents_project_status_idx on public.documents(project_id, status);

-- Triggers: updated_at
create or replace function public.ensure_updated_at_trigger(tbl regclass) returns void as $$
begin
  execute format('drop trigger if exists set_updated_at on %s', tbl);
  execute format('create trigger set_updated_at before update on %s for each row execute procedure public.set_updated_at()', tbl);
end; $$ language plpgsql;

select public.ensure_updated_at_trigger('public.orgs');
select public.ensure_updated_at_trigger('public.members');
select public.ensure_updated_at_trigger('public.projects');
select public.ensure_updated_at_trigger('public.sources');
select public.ensure_updated_at_trigger('public.documents');
select public.ensure_updated_at_trigger('public.chunks');
select public.ensure_updated_at_trigger('public.pipelines');
select public.ensure_updated_at_trigger('public.eval_sets');
select public.ensure_updated_at_trigger('public.eval_runs');
select public.ensure_updated_at_trigger('public.policies');

-- RLS
alter table public.orgs enable row level security;
alter table public.members enable row level security;
alter table public.projects enable row level security;
alter table public.sources enable row level security;
alter table public.documents enable row level security;
alter table public.chunks enable row level security;
alter table public.pipelines enable row level security;
alter table public.eval_sets enable row level security;
alter table public.eval_runs enable row level security;
alter table public.policies enable row level security;
alter table public.audit_logs enable row level security;

-- Policies (drop + create for idempotency)
-- projects
drop policy if exists org_scoped_read_projects on public.projects;
create policy org_scoped_read_projects on public.projects for select using (exists (
  select 1 from public.members m join public.orgs o on m.org_id = o.id where o.id = projects.org_id and m.user_id = auth.uid()
));

drop policy if exists org_scoped_write_projects on public.projects;
create policy org_scoped_write_projects on public.projects for all using (exists (
  select 1 from public.members m join public.orgs o on m.org_id = o.id where o.id = projects.org_id and m.user_id = auth.uid()
)) with check (exists (
  select 1 from public.members m join public.orgs o on m.org_id = o.id where o.id = projects.org_id and m.user_id = auth.uid()
));

-- sources
drop policy if exists org_scoped_read_sources on public.sources;
create policy org_scoped_read_sources on public.sources for select using (public.is_project_member(project_id));

drop policy if exists org_scoped_write_sources on public.sources;
create policy org_scoped_write_sources on public.sources for all using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

-- documents
drop policy if exists org_scoped_read_documents on public.documents;
create policy org_scoped_read_documents on public.documents for select using (public.is_project_member(project_id));

drop policy if exists org_scoped_write_documents on public.documents;
create policy org_scoped_write_documents on public.documents for all using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

-- chunks
drop policy if exists org_scoped_read_chunks on public.chunks;
create policy org_scoped_read_chunks on public.chunks for select using (public.is_project_member(project_id));

drop policy if exists org_scoped_write_chunks on public.chunks;
create policy org_scoped_write_chunks on public.chunks for all using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

-- pipelines
drop policy if exists org_scoped_read_pipelines on public.pipelines;
create policy org_scoped_read_pipelines on public.pipelines for select using (public.is_project_member(project_id));

drop policy if exists org_scoped_write_pipelines on public.pipelines;
create policy org_scoped_write_pipelines on public.pipelines for all using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

-- eval_sets
drop policy if exists org_scoped_read_eval_sets on public.eval_sets;
create policy org_scoped_read_eval_sets on public.eval_sets for select using (public.is_project_member(project_id));

drop policy if exists org_scoped_write_eval_sets on public.eval_sets;
create policy org_scoped_write_eval_sets on public.eval_sets for all using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

-- eval_runs
drop policy if exists org_scoped_read_eval_runs on public.eval_runs;
create policy org_scoped_read_eval_runs on public.eval_runs for select using (public.is_project_member(project_id));

drop policy if exists org_scoped_write_eval_runs on public.eval_runs;
create policy org_scoped_write_eval_runs on public.eval_runs for all using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

-- policies table
drop policy if exists org_scoped_read_policies on public.policies;
create policy org_scoped_read_policies on public.policies for select using (public.is_project_member(project_id));

drop policy if exists org_scoped_write_policies on public.policies;
create policy org_scoped_write_policies on public.policies for all using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

-- audit_logs: read if member; insert only by service role
drop policy if exists audit_read on public.audit_logs;
create policy audit_read on public.audit_logs for select using (public.is_project_member(project_id));

drop policy if exists audit_write_service_role on public.audit_logs;
create policy audit_write_service_role on public.audit_logs for insert with check (auth.role() = 'service_role');

-- Minimal orgs/members policies
 drop policy if exists members_read_self on public.members;
 create policy members_read_self on public.members for select using (user_id = auth.uid());

 drop policy if exists orgs_read_via_membership on public.orgs;
 create policy orgs_read_via_membership on public.orgs for select using (exists (
   select 1 from public.members m where m.org_id = orgs.id and m.user_id = auth.uid()
 ));

-- Storage bucket and policies
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Policy: allow authenticated members to read/write objects in 'documents' bucket scoped by project_id in metadata
-- Read
drop policy if exists documents_read on storage.objects;
create policy documents_read on storage.objects
for select to authenticated
using (
  bucket_id = 'documents'
  and exists (
    select 1 from public.projects p
    join public.members m on m.org_id = p.org_id
    where p.id = (objects.metadata->>'project_id')::uuid
      and m.user_id = auth.uid()
  )
);

-- Insert
drop policy if exists documents_insert on storage.objects;
create policy documents_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'documents'
  and exists (
    select 1 from public.projects p
    join public.members m on m.org_id = p.org_id
    where p.id = (objects.metadata->>'project_id')::uuid
      and m.user_id = auth.uid()
  )
);

-- Update
drop policy if exists documents_update on storage.objects;
create policy documents_update on storage.objects
for update to authenticated
using (
  bucket_id = 'documents'
  and exists (
    select 1 from public.projects p
    join public.members m on m.org_id = p.org_id
    where p.id = (objects.metadata->>'project_id')::uuid
      and m.user_id = auth.uid()
  )
)
with check (
  bucket_id = 'documents'
  and exists (
    select 1 from public.projects p
    join public.members m on m.org_id = p.org_id
    where p.id = (objects.metadata->>'project_id')::uuid
      and m.user_id = auth.uid()
  )
);
