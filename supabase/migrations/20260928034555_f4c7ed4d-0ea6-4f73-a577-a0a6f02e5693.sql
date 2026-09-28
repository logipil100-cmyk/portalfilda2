
create extension if not exists pgcrypto with schema extensions;

-- ===== Tipos =====
create type public.app_role as enum ('admin','secretaria','mister','atleta','encarregado');
create type public.account_status as enum ('PENDENTE','APROVADO','REJEITADO','SUSPENSO','INATIVO');
create type public.account_type as enum ('atleta','encarregado','staff');
create type public.link_status as enum ('PENDENTE','APROVADA','REJEITADA','REVOGADA');
create type public.attendance_status as enum ('PRESENTE','AUSENTE','ATRASADO','JUSTIFICADA');
create type public.announcement_status as enum ('RASCUNHO','PUBLICADO','ARQUIVADO');
create type public.announcement_audience as enum ('GERAL','CATEGORIA','EQUIPA','ATLETA','ENCARREGADO');
create type public.game_status as enum ('AGENDADO','CONCLUIDO','CANCELADO');
create type public.event_kind as enum ('TREINO','JOGO','TORNEIO','REUNIAO','EVENTO','COMUNICADO');

-- ===== Utilitário updated_at =====
create or replace function public.set_updated_at() returns trigger language plpgsql set search_path=public as $$
begin new.updated_at = now(); return new; end $$;

-- ===== Perfis e papéis =====
create table public.profiles (
  id uuid primary key,
  full_name text not null default '',
  email text,
  phone text,
  account_type public.account_type not null default 'atleta',
  status public.account_status not null default 'PENDENTE',
  reviewed_by uuid,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.profiles(status);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path=public as $$
  select exists (select 1 from public.user_roles r join public.profiles p on p.id = r.user_id
                 where r.user_id=_user_id and r.role=_role and p.status='APROVADO')
$$;
create or replace function public.is_staff(_uid uuid) returns boolean language sql stable security definer set search_path=public as $$
  select public.has_role(_uid,'admin') or public.has_role(_uid,'secretaria')
$$;

-- ===== Estrutura desportiva =====
create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  starts_on date not null,
  ends_on date not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  age_range text,
  description text,
  image_url text,
  position int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid not null references public.categories(id) on delete restrict,
  season_id uuid references public.seasons(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(name, season_id)
);
create index on public.teams(category_id);
create table public.team_coaches (
  team_id uuid not null references public.teams(id) on delete cascade,
  coach_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (team_id, coach_id)
);
create index on public.team_coaches(coach_id);

-- ===== Atletas =====
create table public.athletes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles(id) on delete set null,
  process_number text unique,
  full_name text not null check (char_length(full_name) between 3 and 150),
  birth_date date,
  gender text check (gender in ('M','F')),
  photo_url text,
  category_id uuid references public.categories(id) on delete set null,
  team_id uuid references public.teams(id) on delete set null,
  status public.account_status not null default 'PENDENTE',
  position text,
  approved_by uuid, approved_at timestamptz,
  rejected_by uuid, rejected_at timestamptz, rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.athletes(team_id);
create index on public.athletes(category_id);
create index on public.athletes(status);
create index on public.athletes(lower(full_name));

create table public.athlete_private (
  athlete_id uuid primary key references public.athletes(id) on delete cascade,
  id_number text, phone text, address text, school text, nationality text,
  updated_at timestamptz not null default now()
);
create table public.athlete_medical (
  athlete_id uuid primary key references public.athletes(id) on delete cascade,
  blood_type text, allergies text, conditions text, medications text,
  sport_restrictions text, emergency_contact_name text, emergency_contact_phone text,
  updated_at timestamptz not null default now()
);

create table public.process_counters (year int primary key, last_value int not null default 0);

-- ===== Encarregados =====
create table public.guardians (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  default_relationship text,
  created_at timestamptz not null default now()
);
create table public.guardian_link_codes (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  code_hash text not null unique,
  code_hint text not null,
  expires_at timestamptz not null,
  used_at timestamptz, used_by uuid,
  revoked_at timestamptz, revoked_by uuid,
  created_by uuid not null,
  created_at timestamptz not null default now()
);
create index on public.guardian_link_codes(athlete_id);
create table public.athlete_guardians (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  guardian_id uuid not null references public.guardians(id) on delete cascade,
  relationship text not null,
  status public.link_status not null default 'PENDENTE',
  code_id uuid references public.guardian_link_codes(id) on delete set null,
  requested_at timestamptz not null default now(),
  reviewed_by uuid, reviewed_at timestamptz, rejection_reason text,
  revoked_by uuid, revoked_at timestamptz, revoke_reason text,
  created_at timestamptz not null default now()
);
create unique index athlete_guardians_active_uniq on public.athlete_guardians(athlete_id, guardian_id)
  where status in ('PENDENTE','APROVADA');
create index on public.athlete_guardians(guardian_id);

-- ===== Funções de acesso =====
create or replace function public.my_athlete_id(_uid uuid) returns uuid language sql stable security definer set search_path=public as $$
  select a.id from public.athletes a join public.profiles p on p.id=a.user_id
  where a.user_id=_uid and a.status='APROVADO' and p.status='APROVADO' limit 1
$$;
create or replace function public.is_guardian_of(_uid uuid, _athlete uuid) returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.athlete_guardians ag join public.guardians g on g.id=ag.guardian_id
    join public.profiles p on p.id=g.user_id
    join public.athletes a on a.id=ag.athlete_id
    where g.user_id=_uid and ag.athlete_id=_athlete and ag.status='APROVADA' and p.status='APROVADO' and a.status='APROVADO')
$$;
create or replace function public.coaches_team(_uid uuid, _team uuid) returns boolean language sql stable security definer set search_path=public as $$
  select public.has_role(_uid,'mister') and exists(select 1 from public.team_coaches where coach_id=_uid and team_id=_team)
$$;
create or replace function public.coach_can_see(_uid uuid, _athlete uuid) returns boolean language sql stable security definer set search_path=public as $$
  select public.has_role(_uid,'mister') and exists(select 1 from public.athletes a join public.team_coaches tc on tc.team_id=a.team_id
    where a.id=_athlete and a.status='APROVADO' and tc.coach_id=_uid)
$$;
create or replace function public.can_view_athlete(_uid uuid, _athlete uuid) returns boolean language sql stable security definer set search_path=public as $$
  select public.is_staff(_uid) or public.coach_can_see(_uid,_athlete)
      or public.my_athlete_id(_uid)=_athlete or public.is_guardian_of(_uid,_athlete)
$$;
create or replace function public.can_manage_athlete_sport(_uid uuid, _athlete uuid) returns boolean language sql stable security definer set search_path=public as $$
  select public.is_staff(_uid) or public.coach_can_see(_uid,_athlete)
$$;
create or replace function public.user_in_team(_uid uuid, _team uuid) returns boolean language sql stable security definer set search_path=public as $$
  select public.is_staff(_uid) or public.coaches_team(_uid,_team)
   or exists(select 1 from public.athletes a where a.team_id=_team and a.status='APROVADO'
             and (a.id=public.my_athlete_id(_uid) or public.is_guardian_of(_uid,a.id)))
$$;
create or replace function public.user_in_category(_uid uuid, _cat uuid) returns boolean language sql stable security definer set search_path=public as $$
  select public.is_staff(_uid)
   or exists(select 1 from public.team_coaches tc join public.teams t on t.id=tc.team_id where tc.coach_id=_uid and t.category_id=_cat and public.has_role(_uid,'mister'))
   or exists(select 1 from public.athletes a where a.category_id=_cat and a.status='APROVADO'
             and (a.id=public.my_athlete_id(_uid) or public.is_guardian_of(_uid,a.id)))
$$;
create or replace function public.is_active_user(_uid uuid) returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=_uid and status='APROVADO')
$$;

-- ===== Matrículas, treinos, presenças, avaliações =====
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete restrict,
  category_id uuid not null references public.categories(id) on delete restrict,
  team_id uuid references public.teams(id) on delete set null,
  status text not null default 'ATIVA' check (status in ('ATIVA','CONCLUIDA','CANCELADA')),
  notes text,
  created_by uuid,
  created_at timestamptz not null default now(),
  unique(athlete_id, season_id)
);
create table public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  focus text,
  notes text,
  created_by uuid,
  created_at timestamptz not null default now()
);
create index on public.training_sessions(team_id, starts_at);
create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.training_sessions(id) on delete cascade,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  status public.attendance_status not null,
  justification text,
  recorded_by uuid,
  recorded_at timestamptz not null default now(),
  unique(session_id, athlete_id)
);
create index on public.attendance(athlete_id);
create table public.evaluations (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  evaluator_id uuid,
  evaluated_on date not null default current_date,
  scale_max int not null default 10 check (scale_max between 5 and 100),
  technical numeric(5,2), tactical numeric(5,2), physical numeric(5,2),
  discipline numeric(5,2), teamwork numeric(5,2), evolution numeric(5,2),
  observations text,
  created_at timestamptz not null default now()
);
create index on public.evaluations(athlete_id, evaluated_on desc);
create or replace function public.validate_evaluation() returns trigger language plpgsql set search_path=public as $$
begin
  if coalesce(new.technical,0) not between 0 and new.scale_max or coalesce(new.tactical,0) not between 0 and new.scale_max
   or coalesce(new.physical,0) not between 0 and new.scale_max or coalesce(new.discipline,0) not between 0 and new.scale_max
   or coalesce(new.teamwork,0) not between 0 and new.scale_max or coalesce(new.evolution,0) not between 0 and new.scale_max then
    raise exception 'Notas devem estar entre 0 e %', new.scale_max;
  end if;
  return new;
end $$;
create trigger trg_validate_evaluation before insert or update on public.evaluations for each row execute function public.validate_evaluation();

-- ===== Jogos =====
create table public.games (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete set null,
  season_id uuid references public.seasons(id) on delete set null,
  kind text not null default 'JOGO' check (kind in ('JOGO','TORNEIO')),
  opponent text not null,
  starts_at timestamptz not null,
  location text,
  competition text,
  is_home boolean not null default true,
  status public.game_status not null default 'AGENDADO',
  goals_for int check (goals_for >= 0),
  goals_against int check (goals_against >= 0),
  notes text,
  image_url text,
  created_by uuid,
  created_at timestamptz not null default now()
);
create index on public.games(starts_at);
create table public.game_players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  called_up boolean not null default true,
  started boolean not null default false,
  minutes int not null default 0 check (minutes >= 0),
  goals int not null default 0 check (goals >= 0),
  assists int not null default 0 check (assists >= 0),
  yellow_cards int not null default 0 check (yellow_cards between 0 and 2),
  red_cards int not null default 0 check (red_cards between 0 and 1),
  notes text,
  unique(game_id, athlete_id)
);
create index on public.game_players(athlete_id);

create table public.player_statistics (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  season_id uuid references public.seasons(id) on delete cascade,
  games int not null default 0, goals int not null default 0, assists int not null default 0,
  minutes int not null default 0, yellow_cards int not null default 0, red_cards int not null default 0,
  updated_at timestamptz not null default now(),
  unique nulls not distinct (athlete_id, season_id)
);

create or replace function public.refresh_player_statistics(_athlete uuid) returns void language plpgsql security definer set search_path=public as $$
begin
  delete from public.player_statistics where athlete_id=_athlete;
  insert into public.player_statistics(athlete_id, season_id, games, goals, assists, minutes, yellow_cards, red_cards)
  select gp.athlete_id, g.season_id, count(*) filter (where gp.called_up), sum(gp.goals), sum(gp.assists), sum(gp.minutes), sum(gp.yellow_cards), sum(gp.red_cards)
  from public.game_players gp join public.games g on g.id=gp.game_id
  where gp.athlete_id=_athlete and g.status='CONCLUIDO'
  group by gp.athlete_id, g.season_id;
end $$;
create or replace function public.trg_refresh_stats() returns trigger language plpgsql security definer set search_path=public as $$
declare r record;
begin
  if tg_table_name='game_players' then
    perform public.refresh_player_statistics(coalesce(new.athlete_id, old.athlete_id));
  else
    for r in select athlete_id from public.game_players where game_id=coalesce(new.id,old.id) loop
      perform public.refresh_player_statistics(r.athlete_id);
    end loop;
  end if;
  return null;
end $$;
create trigger trg_stats_gp after insert or update or delete on public.game_players for each row execute function public.trg_refresh_stats();
create trigger trg_stats_games after update of status, season_id on public.games for each row execute function public.trg_refresh_stats();

-- ===== Calendário, comunicados, notificações =====
create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  kind public.event_kind not null default 'EVENTO',
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  team_id uuid references public.teams(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  is_public boolean not null default false,
  created_by uuid,
  created_at timestamptz not null default now()
);
create index on public.calendar_events(starts_at);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  audience public.announcement_audience not null default 'GERAL',
  category_id uuid references public.categories(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  athlete_id uuid references public.athletes(id) on delete cascade,
  status public.announcement_status not null default 'RASCUNHO',
  is_public_news boolean not null default false,
  image_url text,
  published_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.announcements(status, published_at desc);

create or replace function public.can_see_announcement(_uid uuid, _id uuid) returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.announcements a where a.id=_id and (
    public.is_staff(_uid) or (a.status='PUBLICADO' and public.is_active_user(_uid) and (
      a.audience='GERAL'
      or (a.audience='CATEGORIA' and public.user_in_category(_uid,a.category_id))
      or (a.audience='EQUIPA' and public.user_in_team(_uid,a.team_id))
      or (a.audience='ATLETA' and (public.can_view_athlete(_uid,a.athlete_id)))
      or (a.audience='ENCARREGADO' and (
            (a.athlete_id is null and public.has_role(_uid,'encarregado'))
            or (a.athlete_id is not null and public.is_guardian_of(_uid,a.athlete_id))))
    ))))
$$;

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.notifications(user_id, created_at desc);

create or replace function public.notify(_user uuid, _kind text, _title text, _body text, _link text default null)
returns void language sql security definer set search_path=public as $$
  insert into public.notifications(user_id, kind, title, body, link) select _user,_kind,_title,_body,_link where _user is not null
$$;
create or replace function public.notify_athlete_circle(_athlete uuid, _kind text, _title text, _body text) returns void language plpgsql security definer set search_path=public as $$
begin
  insert into public.notifications(user_id, kind, title, body)
  select a.user_id, _kind, _title, _body from public.athletes a where a.id=_athlete and a.user_id is not null
  union
  select g.user_id, _kind, _title, _body from public.athlete_guardians ag join public.guardians g on g.id=ag.guardian_id
   where ag.athlete_id=_athlete and ag.status='APROVADA' and g.user_id is not null;
end $$;
create or replace function public.notify_staff(_kind text, _title text, _body text) returns void language sql security definer set search_path=public as $$
  insert into public.notifications(user_id, kind, title, body)
  select distinct r.user_id, _kind, _title, _body from public.user_roles r where r.role in ('admin','secretaria')
$$;

-- ===== Documentos =====
create table public.athlete_documents (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  name text not null,
  doc_type text not null default 'OUTRO',
  storage_path text not null unique,
  athlete_visible boolean not null default true,
  guardian_visible boolean not null default false,
  uploaded_by uuid,
  created_at timestamptz not null default now()
);
create index on public.athlete_documents(athlete_id);

-- ===== Auditoria =====
create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  entity text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index on public.audit_logs(created_at desc);
create index on public.audit_logs(entity, entity_id);

create or replace function public.log_audit(_action text, _entity text, _entity_id text, _details jsonb default '{}'::jsonb)
returns void language sql security definer set search_path=public as $$
  insert into public.audit_logs(actor_id, action, entity, entity_id, details) values (auth.uid(), _action, _entity, _entity_id, coalesce(_details,'{}'::jsonb))
$$;

create or replace function public.trg_audit() returns trigger language plpgsql security definer set search_path=public as $$
declare _id text; _det jsonb;
begin
  if tg_op='DELETE' then _id := (to_jsonb(old)->>'id'); _det := jsonb_build_object('old', to_jsonb(old));
  elsif tg_op='INSERT' then _id := (to_jsonb(new)->>'id'); _det := jsonb_build_object('new', to_jsonb(new));
  else _id := (to_jsonb(new)->>'id');
    select jsonb_object_agg(n.key, jsonb_build_object('de', o.value, 'para', n.value)) into _det
    from jsonb_each(to_jsonb(new)) n join jsonb_each(to_jsonb(old)) o on o.key=n.key
    where n.value is distinct from o.value and n.key not in ('updated_at');
    if _det is null then return new; end if;
  end if;
  if _id is null then _id := coalesce(to_jsonb(new)->>'athlete_id', to_jsonb(old)->>'athlete_id', to_jsonb(new)->>'user_id', to_jsonb(old)->>'user_id'); end if;
  insert into public.audit_logs(actor_id, action, entity, entity_id, details) values (auth.uid(), lower(tg_op), tg_table_name, _id, coalesce(_det,'{}'::jsonb));
  return coalesce(new, old);
end $$;

create trigger audit_athletes after insert or update or delete on public.athletes for each row execute function public.trg_audit();
create trigger audit_athlete_private after update on public.athlete_private for each row execute function public.trg_audit();
create trigger audit_athlete_medical after update on public.athlete_medical for each row execute function public.trg_audit();
create trigger audit_attendance after insert or update or delete on public.attendance for each row execute function public.trg_audit();
create trigger audit_evaluations after insert or update or delete on public.evaluations for each row execute function public.trg_audit();
create trigger audit_documents after insert or delete on public.athlete_documents for each row execute function public.trg_audit();
create trigger audit_links after insert or update or delete on public.athlete_guardians for each row execute function public.trg_audit();
create trigger audit_enrollments after insert or update or delete on public.enrollments for each row execute function public.trg_audit();
create trigger audit_roles after insert or delete on public.user_roles for each row execute function public.trg_audit();
create trigger audit_profiles after update on public.profiles for each row execute function public.trg_audit();
create trigger audit_team_coaches after insert or delete on public.team_coaches for each row execute function public.trg_audit();
create trigger audit_games after insert or update or delete on public.games for each row execute function public.trg_audit();

create trigger upd_profiles before update on public.profiles for each row execute function public.set_updated_at();
create trigger upd_athletes before update on public.athletes for each row execute function public.set_updated_at();
create trigger upd_announcements before update on public.announcements for each row execute function public.set_updated_at();

-- ===== Conteúdo público do site =====
create table public.site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid,
  updated_at timestamptz not null default now()
);
create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'FOTO' check (kind in ('FOTO','VIDEO')),
  title text not null default '',
  image_url text,
  video_url text,
  position int not null default 0,
  created_by uuid,
  created_at timestamptz not null default now()
);
create table public.faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- Treinadores públicos (apenas nome, função, foto e biografia)
create table public.coach_public_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles(id) on delete set null,
  display_name text not null,
  role_title text not null default 'Treinador',
  bio text,
  photo_url text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- ===== Guardas de alteração =====
create or replace function public.guard_profile_update() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if not public.is_staff(auth.uid()) and auth.uid() is not null then
    if new.status is distinct from old.status or new.account_type is distinct from old.account_type
       or new.reviewed_by is distinct from old.reviewed_by or new.reviewed_at is distinct from old.reviewed_at
       or new.rejection_reason is distinct from old.rejection_reason or new.email is distinct from old.email
       or new.id is distinct from old.id then
      raise exception 'Sem permissão para alterar estes campos';
    end if;
  end if;
  if not public.has_role(auth.uid(),'admin') and auth.uid() is not null and old.account_type='staff'
     and new.status is distinct from old.status and auth.uid() <> old.id then
    raise exception 'Apenas o administrador altera o estado de contas da equipa técnica';
  end if;
  return new;
end $$;
create trigger guard_profiles before update on public.profiles for each row execute function public.guard_profile_update();

create or replace function public.guard_athlete_update() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.process_number is distinct from old.process_number and old.process_number is not null then
    raise exception 'O número de processo é permanente';
  end if;
  return new;
end $$;
create trigger guard_athletes before update on public.athletes for each row execute function public.guard_athlete_update();

-- ===== Grants =====
grant select on public.seasons, public.categories, public.teams, public.games, public.site_content,
  public.gallery_items, public.faq_items, public.coach_public_profiles to anon, authenticated;
grant select on public.calendar_events, public.announcements to anon, authenticated;
grant insert, update, delete on public.seasons, public.categories, public.teams, public.games, public.site_content,
  public.gallery_items, public.faq_items, public.coach_public_profiles, public.calendar_events, public.announcements to authenticated;
grant select, insert, update, delete on public.team_coaches, public.athletes, public.athlete_private, public.athlete_medical,
  public.enrollments, public.training_sessions, public.attendance, public.evaluations, public.game_players,
  public.athlete_documents to authenticated;
grant select on public.player_statistics, public.guardians, public.athlete_guardians, public.guardian_link_codes, public.audit_logs to authenticated;
grant update on public.guardians to authenticated;
grant select, update, delete on public.notifications to authenticated;
grant all on all tables in schema public to service_role;

-- ===== RLS =====
alter table public.seasons enable row level security;
alter table public.categories enable row level security;
alter table public.teams enable row level security;
alter table public.team_coaches enable row level security;
alter table public.athletes enable row level security;
alter table public.athlete_private enable row level security;
alter table public.athlete_medical enable row level security;
alter table public.process_counters enable row level security;
alter table public.guardians enable row level security;
alter table public.guardian_link_codes enable row level security;
alter table public.athlete_guardians enable row level security;
alter table public.enrollments enable row level security;
alter table public.training_sessions enable row level security;
alter table public.attendance enable row level security;
alter table public.evaluations enable row level security;
alter table public.games enable row level security;
alter table public.game_players enable row level security;
alter table public.player_statistics enable row level security;
alter table public.calendar_events enable row level security;
alter table public.announcements enable row level security;
alter table public.notifications enable row level security;
alter table public.athlete_documents enable row level security;
alter table public.audit_logs enable row level security;
alter table public.site_content enable row level security;
alter table public.gallery_items enable row level security;
alter table public.faq_items enable row level security;
alter table public.coach_public_profiles enable row level security;

create policy "perfil próprio ou staff" on public.profiles for select to authenticated using (id = auth.uid() or public.is_staff(auth.uid()));
create policy "mister vê nomes de colegas" on public.profiles for select to authenticated using (public.has_role(auth.uid(),'mister') and account_type='staff');
create policy "atualizar próprio perfil ou staff" on public.profiles for update to authenticated using (id = auth.uid() or public.is_staff(auth.uid())) with check (id = auth.uid() or public.is_staff(auth.uid()));

create policy "ver próprios papéis ou staff" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_staff(auth.uid()));

create policy "público lê temporadas" on public.seasons for select using (true);
create policy "staff gere temporadas" on public.seasons for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "público lê categorias" on public.categories for select using (true);
create policy "staff gere categorias" on public.categories for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "público lê equipas" on public.teams for select using (true);
create policy "staff gere equipas" on public.teams for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "ver treinadores de equipa" on public.team_coaches for select to authenticated using (public.is_active_user(auth.uid()));
create policy "staff atribui treinadores" on public.team_coaches for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "ver atleta autorizado" on public.athletes for select to authenticated using (public.can_view_athlete(auth.uid(), id) or (user_id = auth.uid()));
create policy "staff cria atletas" on public.athletes for insert to authenticated with check (public.is_staff(auth.uid()));
create policy "staff altera atletas" on public.athletes for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "admin elimina atletas" on public.athletes for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "privado: staff ou o próprio" on public.athlete_private for select to authenticated using (public.is_staff(auth.uid()) or exists(select 1 from public.athletes a where a.id=athlete_id and a.user_id=auth.uid()));
create policy "privado: staff gere" on public.athlete_private for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "médico: staff ou o próprio" on public.athlete_medical for select to authenticated using (public.is_staff(auth.uid()) or exists(select 1 from public.athletes a where a.id=athlete_id and a.user_id=auth.uid()));
create policy "médico: staff gere" on public.athlete_medical for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "encarregado: próprio ou staff" on public.guardians for select to authenticated using (user_id = auth.uid() or public.is_staff(auth.uid()));
create policy "encarregado atualiza próprio" on public.guardians for update to authenticated using (user_id = auth.uid() or public.is_staff(auth.uid())) with check (user_id = auth.uid() or public.is_staff(auth.uid()));
create policy "códigos: staff ou atleta dono" on public.guardian_link_codes for select to authenticated using (public.is_staff(auth.uid()) or athlete_id = public.my_athlete_id(auth.uid()));
create policy "associações visíveis" on public.athlete_guardians for select to authenticated using (
  public.is_staff(auth.uid()) or athlete_id = public.my_athlete_id(auth.uid())
  or exists(select 1 from public.guardians g where g.id=guardian_id and g.user_id=auth.uid()));

create policy "matrículas visíveis" on public.enrollments for select to authenticated using (public.can_view_athlete(auth.uid(), athlete_id));
create policy "staff gere matrículas" on public.enrollments for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "treinos visíveis" on public.training_sessions for select to authenticated using (public.user_in_team(auth.uid(), team_id));
create policy "staff ou mister cria treinos" on public.training_sessions for insert to authenticated with check (public.is_staff(auth.uid()) or public.coaches_team(auth.uid(), team_id));
create policy "staff ou mister altera treinos" on public.training_sessions for update to authenticated using (public.is_staff(auth.uid()) or public.coaches_team(auth.uid(), team_id)) with check (public.is_staff(auth.uid()) or public.coaches_team(auth.uid(), team_id));
create policy "staff ou mister elimina treinos" on public.training_sessions for delete to authenticated using (public.is_staff(auth.uid()) or public.coaches_team(auth.uid(), team_id));

create policy "presenças visíveis" on public.attendance for select to authenticated using (public.can_view_athlete(auth.uid(), athlete_id));
create policy "registar presenças" on public.attendance for insert to authenticated with check (public.can_manage_athlete_sport(auth.uid(), athlete_id));
create policy "alterar presenças" on public.attendance for update to authenticated using (public.can_manage_athlete_sport(auth.uid(), athlete_id)) with check (public.can_manage_athlete_sport(auth.uid(), athlete_id));
create policy "eliminar presenças" on public.attendance for delete to authenticated using (public.can_manage_athlete_sport(auth.uid(), athlete_id));

create policy "avaliações visíveis" on public.evaluations for select to authenticated using (public.can_view_athlete(auth.uid(), athlete_id));
create policy "criar avaliações" on public.evaluations for insert to authenticated with check (public.can_manage_athlete_sport(auth.uid(), athlete_id) and evaluator_id = auth.uid());
create policy "alterar avaliações" on public.evaluations for update to authenticated using (public.is_staff(auth.uid()) or (evaluator_id = auth.uid() and public.coach_can_see(auth.uid(), athlete_id))) with check (public.can_manage_athlete_sport(auth.uid(), athlete_id));
create policy "eliminar avaliações" on public.evaluations for delete to authenticated using (public.is_staff(auth.uid()));

create policy "público lê jogos" on public.games for select using (true);
create policy "criar jogos" on public.games for insert to authenticated with check (public.is_staff(auth.uid()) or (team_id is not null and public.coaches_team(auth.uid(), team_id)));
create policy "alterar jogos" on public.games for update to authenticated using (public.is_staff(auth.uid()) or (team_id is not null and public.coaches_team(auth.uid(), team_id))) with check (public.is_staff(auth.uid()) or (team_id is not null and public.coaches_team(auth.uid(), team_id)));
create policy "eliminar jogos" on public.games for delete to authenticated using (public.is_staff(auth.uid()));

create policy "convocados visíveis" on public.game_players for select to authenticated using (public.can_view_athlete(auth.uid(), athlete_id));
create policy "gerir convocados" on public.game_players for all to authenticated using (public.can_manage_athlete_sport(auth.uid(), athlete_id)) with check (public.can_manage_athlete_sport(auth.uid(), athlete_id));

create policy "estatísticas visíveis" on public.player_statistics for select to authenticated using (public.can_view_athlete(auth.uid(), athlete_id));

create policy "eventos públicos" on public.calendar_events for select using (is_public);
create policy "eventos internos" on public.calendar_events for select to authenticated using (
  public.is_staff(auth.uid()) or (public.is_active_user(auth.uid()) and (
    (team_id is null and category_id is null) or (team_id is not null and public.user_in_team(auth.uid(), team_id))
    or (category_id is not null and public.user_in_category(auth.uid(), category_id)))));
create policy "staff gere eventos" on public.calendar_events for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "notícias públicas" on public.announcements for select using (status='PUBLICADO' and is_public_news and audience='GERAL');
create policy "comunicados internos" on public.announcements for select to authenticated using (public.can_see_announcement(auth.uid(), id));
create policy "staff gere comunicados" on public.announcements for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "notificações próprias" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "marcar notificações" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "apagar notificações" on public.notifications for delete to authenticated using (user_id = auth.uid());

create policy "documentos visíveis" on public.athlete_documents for select to authenticated using (
  public.is_staff(auth.uid())
  or (athlete_visible and athlete_id = public.my_athlete_id(auth.uid()))
  or (guardian_visible and public.is_guardian_of(auth.uid(), athlete_id)));
create policy "staff gere documentos" on public.athlete_documents for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "admin lê auditoria" on public.audit_logs for select to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "público lê conteúdo" on public.site_content for select using (true);
create policy "admin gere conteúdo" on public.site_content for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "público lê galeria" on public.gallery_items for select using (true);
create policy "staff gere galeria" on public.gallery_items for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "público lê faq" on public.faq_items for select using (true);
create policy "staff gere faq" on public.faq_items for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "público lê treinadores" on public.coach_public_profiles for select using (true);
create policy "admin gere treinadores públicos" on public.coach_public_profiles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ===== Fluxos (RPC) =====
create or replace function public.ensure_profile() returns public.profiles language plpgsql security definer set search_path=public as $$
declare _uid uuid := auth.uid(); _meta jsonb; _email text; _p public.profiles; _type public.account_type; _aid uuid;
begin
  if _uid is null then raise exception 'Sessão inválida'; end if;
  select * into _p from public.profiles where id=_uid;
  if found then return _p; end if;
  select raw_user_meta_data, email into _meta, _email from auth.users where id=_uid;
  _type := case when _meta->>'account_type'='encarregado' then 'encarregado'::public.account_type else 'atleta'::public.account_type end;
  insert into public.profiles(id, full_name, email, phone, account_type, status)
  values (_uid, left(coalesce(nullif(trim(_meta->>'full_name'),''), split_part(_email,'@',1)),150), _email,
          left(nullif(trim(_meta->>'phone'),''),30), _type,
          case when _type='encarregado' then 'APROVADO'::public.account_status else 'PENDENTE'::public.account_status end)
  returning * into _p;
  if _type='encarregado' then
    insert into public.guardians(user_id, full_name, phone, email, default_relationship)
    values (_uid, _p.full_name, _p.phone, _email, left(nullif(trim(_meta->>'relationship'),''),40));
    insert into public.user_roles(user_id, role) values (_uid,'encarregado') on conflict do nothing;
  else
    insert into public.athletes(user_id, full_name, birth_date, gender, category_id, status)
    values (_uid, _p.full_name,
      case when (_meta->>'birth_date') ~ '^\d{4}-\d{2}-\d{2}$' then (_meta->>'birth_date')::date end,
      case when _meta->>'gender' in ('M','F') then _meta->>'gender' end,
      case when (_meta->>'category_id') ~ '^[0-9a-f-]{36}$' and exists(select 1 from public.categories where id=(_meta->>'category_id')::uuid) then (_meta->>'category_id')::uuid end,
      'PENDENTE') returning id into _aid;
    insert into public.athlete_private(athlete_id, id_number, phone, address, school)
    values (_aid, left(nullif(trim(_meta->>'id_number'),''),30), left(nullif(trim(_meta->>'phone'),''),30),
            left(nullif(trim(_meta->>'address'),''),200), left(nullif(trim(_meta->>'school'),''),120));
    insert into public.athlete_medical(athlete_id, emergency_contact_name, emergency_contact_phone, allergies)
    values (_aid, left(nullif(trim(_meta->>'emergency_name'),''),120), left(nullif(trim(_meta->>'emergency_phone'),''),30), left(nullif(trim(_meta->>'allergies'),''),500));
    perform public.notify_staff('inscricao','Nova inscrição pendente', _p.full_name || ' criou conta e aguarda aprovação.');
  end if;
  perform public.log_audit('registo','profiles',_uid::text, jsonb_build_object('tipo',_type));
  return _p;
end $$;

create or replace function public.next_process_number() returns text language plpgsql security definer set search_path=public as $$
declare _y int := extract(year from now())::int; _n int;
begin
  insert into public.process_counters(year,last_value) values (_y,1)
  on conflict (year) do update set last_value = public.process_counters.last_value + 1
  returning last_value into _n;
  return 'FILDA-' || _y || '-' || lpad(_n::text, 6, '0');
end $$;

create or replace function public.approve_account(_profile uuid) returns text language plpgsql security definer set search_path=public as $$
declare _p public.profiles; _a public.athletes; _num text;
begin
  if not public.is_staff(auth.uid()) then raise exception 'Sem permissão'; end if;
  select * into _p from public.profiles where id=_profile for update;
  if not found then raise exception 'Conta não encontrada'; end if;
  if _p.account_type='staff' and not public.has_role(auth.uid(),'admin') then raise exception 'Apenas o administrador'; end if;
  update public.profiles set status='APROVADO', reviewed_by=auth.uid(), reviewed_at=now(), rejection_reason=null where id=_profile;
  if _p.account_type='atleta' then
    select * into _a from public.athletes where user_id=_profile for update;
    if found then
      _num := coalesce(_a.process_number, public.next_process_number());
      update public.athletes set status='APROVADO', process_number=_num, approved_by=auth.uid(), approved_at=now(),
        rejection_reason=null where id=_a.id;
    end if;
    insert into public.user_roles(user_id, role) values (_profile,'atleta') on conflict do nothing;
    perform public.notify(_profile,'aprovacao','Inscrição aprovada','Bem-vindo à FILDA II! O seu número de processo é ' || coalesce(_num,'-') || '.');
  elsif _p.account_type='encarregado' then
    insert into public.user_roles(user_id, role) values (_profile,'encarregado') on conflict do nothing;
    perform public.notify(_profile,'aprovacao','Conta ativada','A sua conta de encarregado está ativa.');
  end if;
  perform public.log_audit('aprovacao','profiles',_profile::text, jsonb_build_object('processo',_num));
  return _num;
end $$;

create or replace function public.reject_account(_profile uuid, _reason text) returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_staff(auth.uid()) then raise exception 'Sem permissão'; end if;
  if coalesce(trim(_reason),'')='' then raise exception 'Indique o motivo'; end if;
  update public.profiles set status='REJEITADO', reviewed_by=auth.uid(), reviewed_at=now(), rejection_reason=left(_reason,500) where id=_profile and account_type<>'staff';
  if not found then raise exception 'Conta não encontrada'; end if;
  update public.athletes set status='REJEITADO', rejected_by=auth.uid(), rejected_at=now(), rejection_reason=left(_reason,500) where user_id=_profile;
  perform public.notify(_profile,'rejeicao','Inscrição não aprovada','Motivo: ' || left(_reason,500));
  perform public.log_audit('rejeicao','profiles',_profile::text, jsonb_build_object('motivo',_reason));
end $$;

create or replace function public.request_correction(_profile uuid, _message text) returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_staff(auth.uid()) then raise exception 'Sem permissão'; end if;
  perform public.notify(_profile,'correcao','Correção necessária na inscrição', left(_message,500));
  perform public.log_audit('pedido_correcao','profiles',_profile::text, jsonb_build_object('mensagem',_message));
end $$;

create or replace function public.set_account_status(_profile uuid, _status public.account_status, _reason text default null) returns void language plpgsql security definer set search_path=public as $$
declare _p public.profiles;
begin
  if not public.is_staff(auth.uid()) then raise exception 'Sem permissão'; end if;
  if _status not in ('SUSPENSO','INATIVO','APROVADO') then raise exception 'Use aprovar/rejeitar para esse estado'; end if;
  select * into _p from public.profiles where id=_profile;
  if _p.account_type='staff' and not public.has_role(auth.uid(),'admin') then raise exception 'Apenas o administrador'; end if;
  if _profile = auth.uid() then raise exception 'Não pode alterar a própria conta'; end if;
  if _status='APROVADO' and _p.status in ('PENDENTE','REJEITADO') then raise exception 'Use a aprovação de inscrição'; end if;
  update public.profiles set status=_status where id=_profile;
  update public.athletes set status=_status where user_id=_profile and status <> 'PENDENTE';
  perform public.notify(_profile,'estado','Estado da conta alterado','Nova situação: ' || _status || coalesce(' — ' || _reason,''));
  perform public.log_audit('estado_conta','profiles',_profile::text, jsonb_build_object('estado',_status,'motivo',_reason));
end $$;

create or replace function public.set_user_role(_user uuid, _role public.app_role, _grant boolean) returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'Apenas o administrador'; end if;
  if _user = auth.uid() and _role='admin' and not _grant then raise exception 'Não pode remover o seu próprio acesso de administrador'; end if;
  if _grant then
    insert into public.user_roles(user_id, role) values (_user,_role) on conflict do nothing;
    if _role in ('admin','secretaria','mister') then
      update public.profiles set account_type='staff', status='APROVADO', reviewed_by=auth.uid(), reviewed_at=now() where id=_user;
    end if;
  else
    delete from public.user_roles where user_id=_user and role=_role;
  end if;
end $$;

-- Staff cria atleta sem conta (inscrição presencial)
create or replace function public.staff_create_athlete(_full_name text, _birth_date date, _gender text, _category uuid, _team uuid) returns uuid language plpgsql security definer set search_path=public as $$
declare _id uuid;
begin
  if not public.is_staff(auth.uid()) then raise exception 'Sem permissão'; end if;
  insert into public.athletes(full_name, birth_date, gender, category_id, team_id, status, process_number, approved_by, approved_at)
  values (trim(_full_name), _birth_date, _gender, _category, _team, 'APROVADO', public.next_process_number(), auth.uid(), now()) returning id into _id;
  insert into public.athlete_private(athlete_id) values (_id);
  insert into public.athlete_medical(athlete_id) values (_id);
  return _id;
end $$;

-- ===== Associação encarregado ↔ atleta =====
create or replace function public.generate_link_code(_athlete uuid) returns text language plpgsql security definer set search_path=public as $$
declare _code text; _alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; _bytes bytea; i int;
begin
  if not (public.is_staff(auth.uid()) or public.my_athlete_id(auth.uid()) = _athlete) then raise exception 'Sem permissão'; end if;
  if not exists(select 1 from public.athletes where id=_athlete and status='APROVADO') then raise exception 'O atleta tem de estar aprovado'; end if;
  update public.guardian_link_codes set revoked_at=now(), revoked_by=auth.uid() where athlete_id=_athlete and used_at is null and revoked_at is null;
  _bytes := extensions.gen_random_bytes(10); _code := '';
  for i in 0..9 loop _code := _code || substr(_alphabet, (get_byte(_bytes,i) % 32) + 1, 1); end loop;
  _code := substr(_code,1,5) || '-' || substr(_code,6,5);
  insert into public.guardian_link_codes(athlete_id, code_hash, code_hint, expires_at, created_by)
  values (_athlete, encode(extensions.digest(_code,'sha256'),'hex'), right(_code,2), now() + interval '72 hours', auth.uid());
  perform public.log_audit('gerar_codigo_associacao','athletes',_athlete::text,'{}');
  return _code;
end $$;

create or replace function public.revoke_link_code(_code_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare _a uuid;
begin
  select athlete_id into _a from public.guardian_link_codes where id=_code_id;
  if not (public.is_staff(auth.uid()) or public.my_athlete_id(auth.uid()) = _a) then raise exception 'Sem permissão'; end if;
  update public.guardian_link_codes set revoked_at=now(), revoked_by=auth.uid() where id=_code_id and used_at is null and revoked_at is null;
  perform public.log_audit('revogar_codigo','guardian_link_codes',_code_id::text,'{}');
end $$;

create or replace function public.redeem_link_code(_code text, _relationship text) returns uuid language plpgsql security definer set search_path=public as $$
declare _g public.guardians; _c public.guardian_link_codes; _attempts int; _link uuid; _norm text;
begin
  if not public.has_role(auth.uid(),'encarregado') then raise exception 'Apenas contas de encarregado'; end if;
  select * into _g from public.guardians where user_id=auth.uid();
  if not found then raise exception 'Perfil de encarregado em falta'; end if;
  if coalesce(trim(_relationship),'')='' then raise exception 'Indique o grau de parentesco'; end if;
  select count(*) into _attempts from public.audit_logs where actor_id=auth.uid() and action in ('codigo_invalido') and created_at > now() - interval '1 hour';
  if _attempts >= 5 then raise exception 'Demasiadas tentativas. Tente novamente mais tarde.'; end if;
  _norm := upper(regexp_replace(coalesce(_code,''),'[^A-Za-z0-9]','','g'));
  if length(_norm) <> 10 then perform public.log_audit('codigo_invalido','guardian_link_codes',null,'{}'); raise exception 'Código inválido ou expirado'; end if;
  _norm := substr(_norm,1,5) || '-' || substr(_norm,6,5);
  select * into _c from public.guardian_link_codes where code_hash = encode(extensions.digest(_norm,'sha256'),'hex') for update;
  if not found or _c.used_at is not null or _c.revoked_at is not null or _c.expires_at < now() then
    perform public.log_audit('codigo_invalido','guardian_link_codes',null,'{}');
    raise exception 'Código inválido ou expirado';
  end if;
  if exists(select 1 from public.athlete_guardians where athlete_id=_c.athlete_id and guardian_id=_g.id and status in ('PENDENTE','APROVADA')) then
    raise exception 'Já existe um pedido ou associação ativa para este atleta';
  end if;
  update public.guardian_link_codes set used_at=now(), used_by=auth.uid() where id=_c.id;
  insert into public.athlete_guardians(athlete_id, guardian_id, relationship, code_id) values (_c.athlete_id, _g.id, left(trim(_relationship),40), _c.id) returning id into _link;
  perform public.notify_staff('associacao','Novo pedido de associação', _g.full_name || ' pediu associação a um atleta.');
  return _link;
end $$;

create or replace function public.review_guardian_link(_link uuid, _approve boolean, _reason text default null) returns void language plpgsql security definer set search_path=public as $$
declare _l public.athlete_guardians; _guser uuid; _aname text;
begin
  if not public.is_staff(auth.uid()) then raise exception 'Sem permissão'; end if;
  select * into _l from public.athlete_guardians where id=_link for update;
  if not found or _l.status <> 'PENDENTE' then raise exception 'Pedido não está pendente'; end if;
  if not _approve and coalesce(trim(_reason),'')='' then raise exception 'Indique o motivo'; end if;
  update public.athlete_guardians set status = case when _approve then 'APROVADA'::public.link_status else 'REJEITADA'::public.link_status end,
    reviewed_by=auth.uid(), reviewed_at=now(), rejection_reason = case when _approve then null else left(_reason,500) end where id=_link;
  select user_id into _guser from public.guardians where id=_l.guardian_id;
  select full_name into _aname from public.athletes where id=_l.athlete_id;
  perform public.notify(_guser,'associacao', case when _approve then 'Associação aprovada' else 'Associação rejeitada' end,
    case when _approve then 'Já pode acompanhar ' || _aname || '.' else 'Motivo: ' || _reason end);
end $$;

create or replace function public.revoke_guardian_link(_link uuid, _reason text) returns void language plpgsql security definer set search_path=public as $$
declare _guser uuid;
begin
  if not public.is_staff(auth.uid()) then raise exception 'Sem permissão'; end if;
  update public.athlete_guardians set status='REVOGADA', revoked_by=auth.uid(), revoked_at=now(), revoke_reason=left(_reason,500)
  where id=_link and status in ('PENDENTE','APROVADA');
  if not found then raise exception 'Associação não encontrada'; end if;
  select g.user_id into _guser from public.athlete_guardians ag join public.guardians g on g.id=ag.guardian_id where ag.id=_link;
  perform public.notify(_guser,'associacao','Associação removida', coalesce(_reason,''));
end $$;

-- Dados médicos mínimos para o mister (segurança desportiva)
create or replace function public.athlete_safety_info(_athlete uuid)
returns table(blood_type text, allergies text, sport_restrictions text, emergency_contact_name text, emergency_contact_phone text)
language sql stable security definer set search_path=public as $$
  select m.blood_type, m.allergies, m.sport_restrictions, m.emergency_contact_name, m.emergency_contact_phone
  from public.athlete_medical m where m.athlete_id=_athlete
  and (public.is_staff(auth.uid()) or public.coach_can_see(auth.uid(), _athlete))
$$;

-- Percentagem de presença real
create or replace function public.attendance_rate(_athlete uuid) returns numeric language sql stable security definer set search_path=public as $$
  select case when count(*)=0 then null else round(100.0 * count(*) filter (where status in ('PRESENTE','ATRASADO')) / count(*), 1) end
  from public.attendance where athlete_id=_athlete and public.can_view_athlete(auth.uid(), _athlete)
$$;

-- Verificação pública da carteira (apenas estado)
create or replace function public.verify_card(_athlete uuid) returns table(full_name text, process_number text, status public.account_status, category text)
language sql stable security definer set search_path=public as $$
  select a.full_name, a.process_number, a.status, c.name from public.athletes a left join public.categories c on c.id=a.category_id
  where a.id=_athlete and a.process_number is not null
$$;

-- Notificações automáticas
create or replace function public.trg_notify_evaluation() returns trigger language plpgsql security definer set search_path=public as $$
begin perform public.notify_athlete_circle(new.athlete_id,'avaliacao','Nova avaliação','Foi registada uma nova avaliação desportiva.'); return new; end $$;
create trigger notify_evaluation after insert on public.evaluations for each row execute function public.trg_notify_evaluation();

create or replace function public.trg_notify_training() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.notifications(user_id, kind, title, body)
  select distinct u, 'treino', 'Novo treino agendado', to_char(new.starts_at at time zone 'Africa/Luanda','DD/MM/YYYY HH24:MI') || coalesce(' — ' || new.location,'')
  from (select a.user_id u from public.athletes a where a.team_id=new.team_id and a.status='APROVADO'
        union select g.user_id from public.athletes a join public.athlete_guardians ag on ag.athlete_id=a.id and ag.status='APROVADA'
        join public.guardians g on g.id=ag.guardian_id where a.team_id=new.team_id and a.status='APROVADO') s where u is not null;
  return new;
end $$;
create trigger notify_training after insert on public.training_sessions for each row execute function public.trg_notify_training();

create or replace function public.trg_notify_callup() returns trigger language plpgsql security definer set search_path=public as $$
declare _g public.games;
begin
  if new.called_up and (tg_op='INSERT' or not old.called_up) then
    select * into _g from public.games where id=new.game_id;
    perform public.notify_athlete_circle(new.athlete_id,'jogo','Convocatória','Convocado para ' || _g.opponent || ' em ' || to_char(_g.starts_at at time zone 'Africa/Luanda','DD/MM/YYYY HH24:MI'));
  end if;
  return new;
end $$;
create trigger notify_callup after insert or update of called_up on public.game_players for each row execute function public.trg_notify_callup();

create or replace function public.trg_notify_announcement() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.status='PUBLICADO' and (tg_op='INSERT' or old.status <> 'PUBLICADO') then
    new.published_at := coalesce(new.published_at, now());
  end if;
  return new;
end $$;
create trigger announcement_publish before insert or update on public.announcements for each row execute function public.trg_notify_announcement();

create or replace function public.trg_announcement_notify_after() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.status='PUBLICADO' and (tg_op='INSERT' or old.status <> 'PUBLICADO') then
    insert into public.notifications(user_id, kind, title, body)
    select p.id, 'comunicado', new.title, left(new.body, 200) from public.profiles p
    where p.status='APROVADO' and public.can_see_announcement(p.id, new.id) and not public.is_staff(p.id);
  end if;
  return new;
end $$;
create trigger announcement_notify after insert or update on public.announcements for each row execute function public.trg_announcement_notify_after();

-- Funções só para utilizadores autenticados
revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated, service_role;
grant execute on function public.verify_card(uuid) to anon;

-- Realtime
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.announcements;
alter publication supabase_realtime add table public.attendance;

-- Categorias oficiais existentes da academia
insert into public.categories(name, age_range, position) values
 ('Sub-11','9-11 anos',1),('Sub-13','12-13 anos',2),('Sub-15','14-15 anos',3),('Sub-17','16-17 anos',4),('Sub-20 / Adulto','18+ anos',5);
