-- Grant admin role to imflash144@gmail.com
INSERT INTO public.user_roles (user_id, role) 
VALUES ('cccaa600-813d-43de-9cc3-af1f9877a4f6', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;

-- Grant admin role to darius@nextleveleventmanagement.com
INSERT INTO public.user_roles (user_id, role) 
VALUES ('8af297fd-8237-4cf4-8d7d-3a94fdb587bc', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;