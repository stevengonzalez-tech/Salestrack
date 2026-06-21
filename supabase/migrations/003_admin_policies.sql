-- Allow admins to update any profile (needed for role management)
create policy "profiles: admin update all"
  on public.profiles for update
  using (public.current_role() = 'admin');

-- Allow admins to read all profiles (complement to leader/admin read)
-- (already covered by leader/admin read policy, but explicit for clarity)
