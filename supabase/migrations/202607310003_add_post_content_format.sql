ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS content_format TEXT NOT NULL DEFAULT 'plain',
  ADD COLUMN IF NOT EXISTS source_filename TEXT;

ALTER TABLE posts
  DROP CONSTRAINT IF EXISTS posts_content_format_check,
  ADD CONSTRAINT posts_content_format_check
    CHECK (content_format IN ('plain', 'markdown', 'mdx'));

ALTER TABLE posts
  DROP CONSTRAINT IF EXISTS posts_source_filename_length_check,
  ADD CONSTRAINT posts_source_filename_length_check
    CHECK (source_filename IS NULL OR char_length(source_filename) <= 255);
