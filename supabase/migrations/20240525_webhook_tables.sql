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

-- Enable row level security
ALTER TABLE webhook_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable all operations for authenticated users only" ON webhook_configs
  FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Enable all operations for authenticated users only" ON webhook_events
  FOR ALL TO authenticated
  USING (true); 