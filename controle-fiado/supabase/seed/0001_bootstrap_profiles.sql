-- Substitua os UUIDs pelos ids reais de auth.users criados no painel do Supabase.
-- Rode manualmente no SQL Editor apenas depois de criar os usuarios no Auth.

insert into public.profiles (
  auth_user_id,
  name,
  role,
  is_active
)
values
  ('1f4ef29d-dffa-4ed8-b089-36d837b7c9f4', 'Dono', 'OWNER', true),
  ('fde6f5f6-08e6-4ce2-8c79-c74e74afc352', 'Operadora', 'STAFF', true)
on conflict (auth_user_id) do nothing;
