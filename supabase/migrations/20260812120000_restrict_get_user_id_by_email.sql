-- Impede que qualquer autenticado enumere e-mail → UUID do Auth.
-- Somente RH, CEO e admin da organização podem resolver o identificador.

create or replace function public.get_user_id_by_email(p_email text)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  caller_role text;
  found_id uuid;
begin
  if auth.role() is distinct from 'service_role' then
    if auth.uid() is null then
      raise exception 'not authorized';
    end if;

    select role into caller_role
    from public.profiles
    where id = auth.uid();

    if caller_role is null or caller_role not in ('rh', 'ceo', 'admin') then
      raise exception 'not authorized';
    end if;
  end if;

  select id
    into found_id
  from auth.users
  where lower(email) = lower(trim(p_email))
  limit 1;

  return found_id;
end;
$$;

revoke all on function public.get_user_id_by_email(text) from public;
grant execute on function public.get_user_id_by_email(text) to authenticated;
grant execute on function public.get_user_id_by_email(text) to service_role;
