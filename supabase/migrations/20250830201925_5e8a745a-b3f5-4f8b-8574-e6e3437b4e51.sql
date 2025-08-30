-- Add admin role for user amrrslan2@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('0dac3acc-7f46-4f28-b76c-3a0d51eadf28', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;