-- Admin user list: expose auth.users.last_sign_in_at (not readable via client RLS).
-- Only callable when is_current_user_admin().

create or replace function public.admin_list_profiles()
returns table (
  id uuid,
  email text,
  display_name text,
  avatar_url text,
  plan text,
  plan_expires_at timestamptz,
  is_admin boolean,
  suspended_at timestamptz,
  suspension_reason text,
  last_sign_in_at timestamptz,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public.is_current_user_admin() is distinct from true then
    raise exception 'Admin required';
  end if;

  return query
  select
    p.id,
    p.email::text,
    p.display_name,
    p.avatar_url,
    p.plan::text,
    p.plan_expires_at,
    coalesce(p.is_admin, false),
    p.suspended_at,
    p.suspension_reason,
    u.last_sign_in_at,
    p.created_at
  from public.profiles p
  left join auth.users u on u.id = p.id
  order by u.last_sign_in_at desc nulls last, p.created_at desc;
end;
$$;

revoke all on function public.admin_list_profiles() from public;
revoke all on function public.admin_list_profiles() from anon;
grant execute on function public.admin_list_profiles() to authenticated;
grant execute on function public.admin_list_profiles() to service_role;

comment on function public.admin_list_profiles() is
  'Admin-only: list profiles joined with auth.users.last_sign_in_at';
