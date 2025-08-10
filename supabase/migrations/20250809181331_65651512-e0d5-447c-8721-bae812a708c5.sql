-- Add RecAI config columns to user profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS recai_api_token TEXT,
  ADD COLUMN IF NOT EXISTS recai_base_url TEXT,
  ADD COLUMN IF NOT EXISTS default_instance_id TEXT;

-- Ensure updated_at auto-updates on profile changes
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure profiles are created on new auth users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();