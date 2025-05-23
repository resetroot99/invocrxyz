import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface TestResult {
  success: boolean;
  error: string | null;
  data: any[] | null;
}

export async function GET() {
  // Testing multiple connection approaches
  
  // 1. Direct connection with hardcoded values
  const directUrl = 'http://localhost:54321';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
  const directClient = createClient(directUrl, anonKey);
  
  // 2. Environment variables
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const envClient = createClient(envUrl, envKey);
  
  // Results container
  const results: {
    direct: TestResult;
    env: TestResult;
    envValues: { url: string; key: string };
  } = {
    direct: { success: false, error: null, data: null },
    env: { success: false, error: null, data: null },
    envValues: { url: envUrl, key: envKey?.substring(0, 10) + '...' },
  };
  
  // Test direct connection
  try {
    const { data, error } = await directClient.from('_sentinel').select('*').limit(1);
    
    if (error) {
      results.direct.error = error.message;
    } else {
      results.direct.success = true;
      results.direct.data = data;
    }
  } catch (err: any) {
    results.direct.error = err.message;
  }
  
  // Test env connection
  try {
    const { data, error } = await envClient.from('_sentinel').select('*').limit(1);
    
    if (error) {
      results.env.error = error.message;
    } else {
      results.env.success = true;
      results.env.data = data;
    }
  } catch (err: any) {
    results.env.error = err.message;
  }
  
  // Return all results
  return NextResponse.json(results);
} 