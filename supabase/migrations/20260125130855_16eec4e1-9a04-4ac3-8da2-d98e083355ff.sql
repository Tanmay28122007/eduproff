-- Drop the insecure policy that allows users to insert their own roles
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;

-- Roles should only be inserted via a trigger or admin function
-- Create a trigger to automatically assign the 'candidate' role on new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'candidate'::app_role);
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for new user registrations
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();