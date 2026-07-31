-- Repair foreign keys after migrating application users to public.profiles.
-- Existing rows are preserved. NOT VALID avoids scanning legacy data but still
-- enforces the corrected references for new and updated rows.

BEGIN;

DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  IF to_regclass('public.profiles') IS NULL THEN
    RAISE EXCEPTION 'public.profiles does not exist. Run the profiles migration before this repair.';
  END IF;

  IF to_regclass('public.posts') IS NOT NULL
     AND EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'posts'
         AND column_name = 'author_id'
     ) THEN
    FOR constraint_name IN
      SELECT con.conname
      FROM pg_constraint con
      JOIN pg_attribute att
        ON att.attrelid = con.conrelid
       AND att.attnum = ANY(con.conkey)
      WHERE con.conrelid = 'public.posts'::regclass
        AND con.contype = 'f'
        AND att.attname = 'author_id'
    LOOP
      EXECUTE format('ALTER TABLE public.posts DROP CONSTRAINT %I', constraint_name);
    END LOOP;

    ALTER TABLE public.posts
      ADD CONSTRAINT posts_author_id_fkey
      FOREIGN KEY (author_id)
      REFERENCES public.profiles(id)
      ON DELETE CASCADE
      NOT VALID;
  END IF;

  IF to_regclass('public.comments') IS NOT NULL
     AND EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'comments'
         AND column_name = 'user_id'
     ) THEN
    FOR constraint_name IN
      SELECT con.conname
      FROM pg_constraint con
      JOIN pg_attribute att
        ON att.attrelid = con.conrelid
       AND att.attnum = ANY(con.conkey)
      WHERE con.conrelid = 'public.comments'::regclass
        AND con.contype = 'f'
        AND att.attname = 'user_id'
    LOOP
      EXECUTE format('ALTER TABLE public.comments DROP CONSTRAINT %I', constraint_name);
    END LOOP;

    ALTER TABLE public.comments
      ADD CONSTRAINT comments_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES public.profiles(id)
      ON DELETE CASCADE
      NOT VALID;
  END IF;
END
$$;

COMMIT;

NOTIFY pgrst, 'reload schema';
