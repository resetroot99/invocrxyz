import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { estimateId, xml } = await req.json();
    
    // Determine which environment to use based on a flag or env var
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.CCC_PROD_BASE 
      : process.env.CCC_SANDBOX_BASE;
      
    const token = process.env.NODE_ENV === 'production'
      ? process.env.CCC_PROD_TOKEN
      : process.env.CCC_SANDBOX_TOKEN;
    
    // Call the CCC API to post the invoice
    const response = await fetch(`${baseUrl}/v7/estimate/${estimateId}/invoice`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/xml'
      },
      body: xml
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CCC API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { success: false, error: `API Error ${response.status}` },
        { status: response.status }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error posting invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to post invoice' },
      { status: 500 }
    );
  }
} 