CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'author', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  content_format TEXT NOT NULL DEFAULT 'plain'
    CHECK (content_format IN ('plain', 'markdown', 'mdx')),
  source_filename TEXT CHECK (source_filename IS NULL OR char_length(source_filename) <= 255),
  description TEXT,
  cover_image TEXT,
  emoji TEXT DEFAULT '',
  diary_date DATE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reading_time INT DEFAULT 0,
  display_order INT,
  is_published BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'wide' CHECK (type IN ('wide', 'narrow')),
  accent TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  slug TEXT UNIQUE,
  github_url TEXT,
  website_url TEXT,
  content TEXT,
  featured_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_tags (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_is_published ON posts(is_published);
CREATE UNIQUE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_projects_sort_order ON projects(sort_order);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role = 'admin'
      AND is_active = TRUE
  );
$$;

CREATE POLICY profiles_select_public ON profiles
  FOR SELECT USING (TRUE);

CREATE POLICY profiles_insert_self ON profiles
  FOR INSERT WITH CHECK (id = auth.uid() OR is_admin());

CREATE POLICY profiles_update_self_or_admin ON profiles
  FOR UPDATE USING (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());

CREATE POLICY posts_select_public_or_owner ON posts
  FOR SELECT USING (
    (deleted_at IS NULL AND is_published = TRUE)
    OR author_id = auth.uid()
    OR is_admin()
  );

CREATE POLICY posts_insert_owner ON posts
  FOR INSERT WITH CHECK (author_id = auth.uid() OR is_admin());

CREATE POLICY posts_update_owner_or_admin ON posts
  FOR UPDATE USING (author_id = auth.uid() OR is_admin())
  WITH CHECK (author_id = auth.uid() OR is_admin());

CREATE POLICY posts_delete_owner_or_admin ON posts
  FOR DELETE USING (author_id = auth.uid() OR is_admin());

CREATE POLICY tags_select_public ON tags
  FOR SELECT USING (TRUE);

CREATE POLICY tags_insert_admin ON tags
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY tags_update_admin ON tags
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY tags_delete_admin ON tags
  FOR DELETE USING (is_admin());

CREATE POLICY post_tags_select_public ON post_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_tags.post_id
        AND posts.deleted_at IS NULL
        AND (posts.is_published = TRUE OR posts.author_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY post_tags_insert_owner_or_admin ON post_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_tags.post_id
        AND (posts.author_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY post_tags_delete_owner_or_admin ON post_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_tags.post_id
        AND (posts.author_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY comments_select_public ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = comments.post_id
        AND posts.deleted_at IS NULL
        AND posts.is_published = TRUE
    )
    OR user_id = auth.uid()
    OR is_admin()
  );

CREATE POLICY comments_insert_user ON comments
  FOR INSERT WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY comments_update_user_or_admin ON comments
  FOR UPDATE USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY comments_delete_user_or_admin ON comments
  FOR DELETE USING (user_id = auth.uid() OR is_admin());

CREATE POLICY projects_select_public ON projects
  FOR SELECT USING (TRUE);

CREATE POLICY projects_insert_admin ON projects
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY projects_update_admin ON projects
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY projects_delete_admin ON projects
  FOR DELETE USING (is_admin());

CREATE POLICY project_tags_select_public ON project_tags
  FOR SELECT USING (TRUE);

CREATE POLICY project_tags_insert_admin ON project_tags
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY project_tags_delete_admin ON project_tags
  FOR DELETE USING (is_admin());
