-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- Create tables
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ccc_status TEXT,
    raw_payload TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create documents table for vector embeddings
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB,
    embedding VECTOR(1536),  -- For OpenAI embeddings
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create webhook config table
CREATE TABLE IF NOT EXISTS webhook_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ccc_id TEXT NOT NULL,
  marketplace_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  secret TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create webhook events table
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  received_at TIMESTAMPTZ NOT NULL,
  processed_at TIMESTAMPTZ
);

-- Add indexes
CREATE INDEX IF NOT EXISTS webhook_config_ccc_id_idx ON webhook_configs (ccc_id);
CREATE INDEX IF NOT EXISTS webhook_events_processed_idx ON webhook_events (processed);

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
ALTER TABLE webhook_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to access only their own invoices
CREATE POLICY "Users can view their own invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() = user_id);

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

-- Create policies for webhooks
CREATE POLICY "Enable all operations for authenticated users only" ON webhook_configs
  FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Enable all operations for authenticated users only" ON webhook_events
  FOR ALL TO authenticated
  USING (true); 