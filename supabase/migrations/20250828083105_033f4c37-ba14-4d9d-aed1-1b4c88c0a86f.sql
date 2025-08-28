-- Add admin user to user_roles table
INSERT INTO public.user_roles (user_id, role) 
VALUES ('533e2546-4c4a-40f0-bc5d-536df12d7f42', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;