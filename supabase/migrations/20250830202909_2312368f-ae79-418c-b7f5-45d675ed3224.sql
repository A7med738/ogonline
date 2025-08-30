-- Add admin role for user ID c6a80fd2-3d90-4097-808f-031caa5753d2
INSERT INTO public.user_roles (user_id, role)
VALUES ('c6a80fd2-3d90-4097-808f-031caa5753d2', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;