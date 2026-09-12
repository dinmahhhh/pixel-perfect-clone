REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_business() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_single_current_dataset() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_business_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_business_role(uuid, uuid, public.business_role[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_business_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_business_role(uuid, uuid, public.business_role[]) TO authenticated;