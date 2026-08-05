ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS display_order INTEGER;

CREATE INDEX IF NOT EXISTS idx_posts_display_order
  ON public.posts(display_order);
