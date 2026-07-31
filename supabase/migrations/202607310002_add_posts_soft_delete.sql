BEGIN;

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

DROP POLICY IF EXISTS posts_select_public_or_owner ON public.posts;
CREATE POLICY posts_select_public_or_owner ON public.posts
  FOR SELECT USING (
    (deleted_at IS NULL AND is_published = TRUE)
    OR author_id = auth.uid()
    OR is_admin()
  );

COMMIT;

NOTIFY pgrst, 'reload schema';
