ALTER TABLE posts
  DROP CONSTRAINT IF EXISTS posts_content_format_check,
  ADD CONSTRAINT posts_content_format_check
    CHECK (content_format IN ('plain', 'markdown', 'mdx'));
