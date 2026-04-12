-- Substitua os UUIDs pelos ids reais de auth.users criados no painel do Supabase.
-- Rode manualmente no SQL Editor apenas depois de criar os usuarios no Auth.

insert into public.profiles (
  auth_user_id,
  name,
  role,
  is_active
)
values
  ('00000000-0000-0000-0000-000000000001', 'Dono', 'OWNER', true),
  ('00000000-0000-0000-0000-000000000002', 'Operadora', 'STAFF', true)
on conflict (auth_user_id) do nothing;
