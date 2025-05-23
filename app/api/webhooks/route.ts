import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Webhook configuration validation
const isValidWebhookConfig = (config: any) => {
  return (
    config && 
    typeof config.endpoint === 'string' && 
    typeof config.secret === 'string' && 
    typeof config.marketplace_id === 'string'
  );
};

// GET webhooks configuration
export async function GET() {
  try {
    // Get webhook configs from the database
    const { data, error } = await supabase
      .from('webhook_configs')
      .select('*');
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      webhooks: data || [] 
    });
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch webhook configurations' 
    }, { status: 500 });
  }
}

// POST to create or update a webhook
export async function POST(request: Request) {
  try {
    const { config, marketplace, ccc_id } = await request.json();
    
    if (!config || !marketplace || !ccc_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }
    
    if (!isValidWebhookConfig(config)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid webhook configuration' 
      }, { status: 400 });
    }
    
    // Insert or update the webhook configuration
    const { data, error } = await supabase
      .from('webhook_configs')
      .upsert({
        ccc_id,
        marketplace_id: marketplace,
        endpoint: config.endpoint,
        secret: config.secret,
        enabled: true,
        metadata: {
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        }
      })
      .select();
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      webhook: data?.[0] || null
    });
  } catch (error) {
    console.error('Error saving webhook:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save webhook configuration' 
    }, { status: 500 });
  }
}

// Handle incoming webhook notifications from CCC or SecureShare
export async function PUT(request: Request) {
  try {
    const { event, data, source } = await request.json();
    
    if (!event || !data || !source) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }
    
    // Log the webhook event
    const { error } = await supabase
      .from('webhook_events')
      .insert({
        source,
        event_type: event,
        payload: data,
        processed: false,
        received_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error logging webhook event:', error);
    }
    
    // Process the webhook based on event type
    switch (event) {
      case 'invoice.created':
      case 'invoice.updated':
        // Process invoice events
        await processInvoiceEvent(data);
        break;
      
      case 'marketplace.listing':
        // Process marketplace listing events
        await processMarketplaceEvent(data);
        break;
        
      default:
        console.log(`Unhandled webhook event type: ${event}`);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook received and processed' 
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process webhook' 
    }, { status: 500 });
  }
}

// Process invoice-related events
async function processInvoiceEvent(data: any) {
  try {
    // Example implementation
    console.log('Processing invoice event:', data);
    // Add your invoice event processing logic here
  } catch (error) {
    console.error('Error processing invoice event:', error);
  }
}

// Process marketplace-related events
async function processMarketplaceEvent(data: any) {
  try {
    // Example implementation
    console.log('Processing marketplace event:', data);
    // Add your marketplace event processing logic here
  } catch (error) {
    console.error('Error processing marketplace event:', error);
  }
} 