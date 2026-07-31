-- Idempotent repair for the posts schema used by the FastAPI ORM.
-- Existing data is preserved; existing columns are not overwritten.

BEGIN;

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS cover_image TEXT;

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS reading_time INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

COMMIT;

NOTIFY pgrst, 'reload schema';
