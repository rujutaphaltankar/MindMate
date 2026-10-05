-- MindMate AI Supabase schema
-- Apply this file in the Supabase SQL Editor or with the Supabase CLI.
-- User-owned records are protected by RLS. Keep the service-role key on the
-- server only; never expose it through a VITE_* variable.

create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    name text not null default '',
    role text not null default 'user' check (role in ('user', 'admin')),
    privacy_settings jsonb not null default
        '{"allow_ai_analysis": false, "allow_anonymous_analytics": false}'::jsonb
        check (jsonb_typeof(privacy_settings) = 'object'),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.mood_records (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles (id) on delete cascade,
    mood smallint not null check (mood between 1 and 10),
    stress smallint not null check (stress between 1 and 10),
    energy smallint not null check (energy between 1 and 10),
    sleep_hours numeric(4, 2) not null default 0
        check (sleep_hours between 0 and 24),
    note text not null default '' check (char_length(note) <= 1000),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.journal_entries (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles (id) on delete cascade,
    text text not null check (char_length(trim(text)) > 0),
    mood smallint check (mood between 1 and 10),
    stress smallint check (stress between 1 and 10),
    energy smallint check (energy between 1 and 10),
    tags text[] not null default '{}' check (
        tags <@ array[
            'College', 'Work', 'Family', 'Relationships',
            'Exams', 'Sleep', 'Exercise', 'Personal'
        ]::text[]
    ),
    ai_analysis jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.activity_history (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles (id) on delete cascade,
    activity_id text not null,
    activity_type text not null,
    duration numeric(7, 2) not null default 0 check (duration >= 0),
    completed_at timestamptz not null default now()
);

create table if not exists public.chat_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles (id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null references public.chat_sessions (id) on delete cascade,
    role text not null check (role in ('user', 'assistant')),
    content text not null,
    flagged boolean not null default false,
    created_at timestamptz not null default now()
);

create table if not exists public.community_posts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles (id) on delete cascade,
    text text not null check (char_length(trim(text)) between 1 and 2000),
    category text not null default 'General Wellness' check (
        category in (
            'Student Life', 'Stress', 'Motivation', 'Relationships',
            'Productivity', 'Sleep', 'General Wellness'
        )
    ),
    likes integer not null default 0 check (likes >= 0),
    comment_count integer not null default 0 check (comment_count >= 0),
    moderation_status text not null default 'SAFE'
        check (moderation_status in ('SAFE', 'REVIEW_REQUIRED', 'BLOCK')),
    created_at timestamptz not null default now()
);

create table if not exists public.community_post_likes (
    post_id uuid not null references public.community_posts (id) on delete cascade,
    user_id uuid not null references public.profiles (id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (post_id, user_id)
);

create table if not exists public.community_comments (
    id uuid primary key default gen_random_uuid(),
    post_id uuid not null references public.community_posts (id) on delete cascade,
    user_id uuid not null references public.profiles (id) on delete cascade,
    text text not null check (char_length(trim(text)) > 0),
    moderation_status text not null default 'SAFE'
        check (moderation_status in ('SAFE', 'REVIEW_REQUIRED', 'BLOCK')),
    created_at timestamptz not null default now()
);

create table if not exists public.reports (
    id uuid primary key default gen_random_uuid(),
    post_id uuid not null references public.community_posts (id) on delete cascade,
    reporter_user_id uuid not null references public.profiles (id) on delete cascade,
    reason text not null default 'Not specified' check (char_length(reason) <= 500),
    status text not null default 'open' check (status in ('open', 'resolved')),
    created_at timestamptz not null default now()
);

create unique index if not exists reports_one_open_report_per_user_post
    on public.reports (post_id, reporter_user_id)
    where status = 'open';

create table if not exists public.resources (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text not null default '',
    country text not null default '',
    phone text not null default '',
    website text not null default '',
    availability text not null default '',
    category text not null default '',
    created_at timestamptz not null default now()
);

create index if not exists mood_records_user_created_idx
    on public.mood_records (user_id, created_at desc);
create index if not exists journal_entries_user_created_idx
    on public.journal_entries (user_id, created_at desc);
create index if not exists journal_entries_tags_idx
    on public.journal_entries using gin (tags);
create index if not exists activity_history_user_completed_idx
    on public.activity_history (user_id, completed_at desc);
create index if not exists chat_sessions_user_updated_idx
    on public.chat_sessions (user_id, updated_at desc);
create index if not exists chat_messages_session_created_idx
    on public.chat_messages (session_id, created_at);
create index if not exists community_posts_created_idx
    on public.community_posts (created_at desc);
create index if not exists community_post_likes_user_idx
    on public.community_post_likes (user_id, post_id);
create index if not exists community_comments_post_created_idx
    on public.community_comments (post_id, created_at);
create index if not exists reports_status_created_idx
    on public.reports (status, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
    before update on public.profiles
    for each row execute function public.set_updated_at();
drop trigger if exists mood_records_set_updated_at on public.mood_records;
create trigger mood_records_set_updated_at
    before update on public.mood_records
    for each row execute function public.set_updated_at();
drop trigger if exists journal_entries_set_updated_at on public.journal_entries;
create trigger journal_entries_set_updated_at
    before update on public.journal_entries
    for each row execute function public.set_updated_at();
drop trigger if exists chat_sessions_set_updated_at on public.chat_sessions;
create trigger chat_sessions_set_updated_at
    before update on public.chat_sessions
    for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, name)
    values (
        new.id,
        coalesce(
            nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
            split_part(coalesce(new.email, ''), '@', 1)
        )
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.create_profile_for_new_user();

insert into public.profiles (id, name)
select
    id,
    coalesce(
        nullif(trim(raw_user_meta_data ->> 'name'), ''),
        split_part(coalesce(email, ''), '@', 1)
    )
from auth.users
on conflict (id) do nothing;

-- Use a SECURITY DEFINER helper to avoid recursive profiles RLS checks.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.profiles
        where id = (select auth.uid())
          and role = 'admin'
    );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

create or replace function public.update_community_post_counts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if tg_table_name = 'community_post_likes' then
        if tg_op = 'INSERT' then
            update public.community_posts
            set likes = likes + 1
            where id = new.post_id;
            return new;
        end if;
        update public.community_posts
        set likes = greatest(likes - 1, 0)
        where id = old.post_id;
        return old;
    end if;

    if tg_op = 'INSERT' then
        update public.community_posts
        set comment_count = comment_count + 1
        where id = new.post_id;
        return new;
    end if;
    update public.community_posts
    set comment_count = greatest(comment_count - 1, 0)
    where id = old.post_id;
    return old;
end;
$$;

create trigger community_post_likes_update_count
    after insert or delete on public.community_post_likes
    for each row execute function public.update_community_post_counts();
create trigger community_comments_update_count
    after insert or delete on public.community_comments
    for each row execute function public.update_community_post_counts();

alter table public.profiles enable row level security;
alter table public.mood_records enable row level security;
alter table public.journal_entries enable row level security;
alter table public.activity_history enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_post_likes enable row level security;
alter table public.community_comments enable row level security;
alter table public.reports enable row level security;
alter table public.resources enable row level security;

create policy "Users can read their own profile"
    on public.profiles for select to authenticated
    using (id = (select auth.uid()));
create policy "Users can update their own profile"
    on public.profiles for update to authenticated
    using (id = (select auth.uid()))
    with check (id = (select auth.uid()));

create policy "Users manage their own mood records"
    on public.mood_records for all to authenticated
    using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()));
create policy "Users manage their own journal entries"
    on public.journal_entries for all to authenticated
    using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()));
create policy "Users manage their own activity history"
    on public.activity_history for all to authenticated
    using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()));

create policy "Users can read their own chat sessions"
    on public.chat_sessions for select to authenticated
    using (user_id = (select auth.uid()));
create policy "Users can read messages in their own sessions"
    on public.chat_messages for select to authenticated
    using (
        exists (
            select 1 from public.chat_sessions
            where chat_sessions.id = chat_messages.session_id
              and chat_sessions.user_id = (select auth.uid())
        )
    );

create policy "Signed-in users can read visible community posts"
    on public.community_posts for select to authenticated
    using (moderation_status <> 'BLOCK');
create policy "Users can delete their own community posts"
    on public.community_posts for delete to authenticated
    using (user_id = (select auth.uid()));
create policy "Admins can update community moderation"
    on public.community_posts for update to authenticated
    using ((select public.is_admin()))
    with check ((select public.is_admin()));

create policy "Users can read their own post likes"
    on public.community_post_likes for select to authenticated
    using (user_id = (select auth.uid()));
create policy "Users can like posts as themselves"
    on public.community_post_likes for insert to authenticated
    with check (
        user_id = (select auth.uid())
        and exists (
            select 1 from public.community_posts
            where community_posts.id = community_post_likes.post_id
              and community_posts.moderation_status <> 'BLOCK'
        )
    );
create policy "Users can remove their own likes"
    on public.community_post_likes for delete to authenticated
    using (user_id = (select auth.uid()));

create policy "Signed-in users can read visible comments"
    on public.community_comments for select to authenticated
    using (
        moderation_status <> 'BLOCK'
        and exists (
            select 1 from public.community_posts
            where community_posts.id = community_comments.post_id
              and community_posts.moderation_status <> 'BLOCK'
        )
    );
create policy "Users can delete their own comments"
    on public.community_comments for delete to authenticated
    using (user_id = (select auth.uid()));

create policy "Users can read their own reports"
    on public.reports for select to authenticated
    using (reporter_user_id = (select auth.uid()));
create policy "Users can report visible posts"
    on public.reports for insert to authenticated
    with check (
        reporter_user_id = (select auth.uid())
        and exists (
            select 1 from public.community_posts
            where community_posts.id = reports.post_id
              and community_posts.moderation_status <> 'BLOCK'
        )
    );
create policy "Admins can review and resolve reports"
    on public.reports for all to authenticated
    using ((select public.is_admin()))
    with check ((select public.is_admin()));

create policy "Resources are readable by everyone"
    on public.resources for select to anon, authenticated
    using (true);
create policy "Admins can add resources"
    on public.resources for insert to authenticated
    with check ((select public.is_admin()));
create policy "Admins can delete resources"
    on public.resources for delete to authenticated
    using ((select public.is_admin()));

-- Remove broad defaults before granting only the columns/actions the app needs.
revoke all on public.profiles, public.mood_records, public.journal_entries,
    public.activity_history, public.chat_sessions, public.chat_messages,
    public.community_posts, public.community_post_likes, public.community_comments,
    public.reports, public.resources from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (name, privacy_settings) on public.profiles to authenticated;

grant select, insert, update, delete on public.mood_records,
    public.journal_entries, public.activity_history to authenticated;

grant select on public.chat_sessions to authenticated;
grant select on public.chat_messages to authenticated;

-- Author IDs and moderation internals are never selectable from the client.
grant select (id, text, category, likes, comment_count, created_at)
    on public.community_posts to authenticated;
grant delete on public.community_posts to authenticated;
grant update (moderation_status) on public.community_posts to authenticated;

grant select (post_id, user_id, created_at), insert (post_id, user_id),
    delete on public.community_post_likes to authenticated;
grant select (id, post_id, text, created_at), delete
    on public.community_comments to authenticated;
grant select (id, post_id, reason, status, created_at),
    insert (post_id, reporter_user_id, reason), update (status)
    on public.reports to authenticated;

grant select on public.resources to anon, authenticated;
grant insert (name, description, country, phone, website, availability, category),
    delete on public.resources to authenticated;

comment on table public.profiles is
    'Supabase Auth profile. Only users can edit name/privacy settings; role is server-managed.';
comment on table public.journal_entries is
    'Private user journal data; row-level security restricts all operations to the owner.';
comment on table public.community_posts is
    'Anonymous community posts. Author IDs and moderation state are hidden from client SELECT.';
comment on table public.resources is
    'Public crisis and wellness resource directory; verify resource details before production use.';
