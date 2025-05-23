-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- Explicitly create the public schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS public;

-- Create invoices table
DROP TABLE IF EXISTS public.invoices;
CREATE TABLE public.invoices (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ccc_status TEXT,
    raw_payload TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create documents table for vector embeddings
DROP TABLE IF EXISTS public.documents;
CREATE TABLE public.documents (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB,
    embedding VECTOR(1536),  -- For OpenAI embeddings
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create storage buckets for invoices
INSERT INTO storage.buckets (id, name, public) 
VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO NOTHING;

-- Add storage policies for invoices bucket
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES 
('Invoice Storage', 
 '(bucket_id = ''invoices''::text) AND (auth.role() = ''authenticated''::text)', 
 'invoices')
ON CONFLICT (name, definition, bucket_id) DO NOTHING;

-- Create function for matching documents based on vector similarity
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 5
) RETURNS TABLE (
  id TEXT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create RLS policies
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to access only their own invoices
CREATE POLICY "Users can view their own invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() = user_id)
  OR EXISTS (
    SELECT 1 FROM supabase_admin.admin_users
    WHERE user_id = auth.uid()
  );

CREATE POLICY "Users can insert their own invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices"
  ON public.invoices FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for authenticated users to access documents related to their invoices
CREATE POLICY "Users can view documents related to their invoices"
  ON public.documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.user_id = auth.uid()
        AND invoices.id = (metadata->>'invoiceId')::TEXT
    )
  );

CREATE POLICY "Users can insert documents"
  ON public.documents FOR INSERT
  WITH CHECK (true);  -- This will be restricted at the application level 