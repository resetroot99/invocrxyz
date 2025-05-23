import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client
const supabaseUrl = 'http://localhost:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

export async function GET() {
  try {
    // Create schema using raw SQL
    const schemaSQL = `
    -- Enable the pgvector extension to work with embedding vectors
    CREATE EXTENSION IF NOT EXISTS vector;

    -- Create tables
    CREATE TABLE IF NOT EXISTS public.invoices (
        id TEXT PRIMARY KEY,
        user_id UUID,
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
    CREATE TABLE IF NOT EXISTS public.webhook_configs (
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
    CREATE TABLE IF NOT EXISTS public.webhook_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      source TEXT NOT NULL,
      event_type TEXT NOT NULL,
      payload JSONB NOT NULL,
      processed BOOLEAN DEFAULT FALSE,
      received_at TIMESTAMPTZ NOT NULL,
      processed_at TIMESTAMPTZ
    );

    -- Add indexes
    CREATE INDEX IF NOT EXISTS webhook_config_ccc_id_idx ON public.webhook_configs (ccc_id);
    CREATE INDEX IF NOT EXISTS webhook_events_processed_idx ON public.webhook_events (processed);
    `;

    const { error: schemaError } = await supabase.rpc('pgx_query', { query: schemaSQL });
    
    if (schemaError) {
      console.error('Schema creation error:', schemaError);
      
      // Try using the REST API directly as a fallback
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          message: 'Database initialized via API endpoint'
        }),
      });
      
      const data = await response.json();
      
      return NextResponse.json({
        success: false,
        error: schemaError.message,
        apiResponse: data
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database schema initialized successfully'
    });
  } catch (error) {
    console.error('Error setting up database:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to set up database'
    }, { status: 500 });
  }
} 