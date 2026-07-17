-- Enable RLS on the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 1. Users can view their own profile. Admins and teachers can view all profiles.
CREATE POLICY "View user profiles"
ON public.users
FOR SELECT
USING (
  auth.uid() = id
  OR (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'teacher')
);

-- 2. Insert is restricted to the database trigger handle_new_user()
-- (Trigger bypasses RLS by running as SECURITY DEFINER, so we don't need an INSERT policy here)

-- 3. Users can update their own profiles, but CANNOT change their role. Admins can update any field.
CREATE POLICY "Update user profiles"
ON public.users
FOR UPDATE
USING (
  auth.uid() = id 
  OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  -- If not an admin, ensure the role is not being changed
  ((SELECT role FROM public.users WHERE id = auth.uid()) != 'admin' AND role = (SELECT role FROM public.users WHERE id = id))
  OR 
  ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin')
);

-- 4. Only admins can delete profiles
CREATE POLICY "Delete user profiles"
ON public.users
FOR DELETE
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);
