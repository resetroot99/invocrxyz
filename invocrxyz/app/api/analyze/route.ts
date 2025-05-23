import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const { ocrText, imageId } = await request.json();
    
    if (!ocrText) {
      return NextResponse.json({ 
        success: false, 
        error: 'OCR text is required' 
      }, { status: 400 });
    }
    
    // Analyze the OCR text using OpenAI
    const prompt = `
      Extract the following information from this invoice OCR text:
      - Invoice Date
      - Invoice Number
      - Total Amount
      - Vendor/Company Name
      - Line Items with quantities and prices if available
      
      OCR Text:
      ${ocrText}
      
      Format the output as JSON with these keys: date, invoiceNumber, totalAmount, vendor, lineItems
    `;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { "role": "system", "content": "You are an invoice analysis assistant. Extract structured information from invoice OCR text." },
        { "role": "user", "content": prompt }
      ],
      temperature: 0.2,
    });
    
    const analysisText = completion.choices[0]?.message?.content || '';
    let analysisJson;
    
    try {
      // Try to parse the result as JSON
      analysisJson = JSON.parse(analysisText.replace(/```json|```/g, '').trim());
    } catch (e) {
      console.error('Failed to parse OpenAI response as JSON', e);
      analysisJson = { rawText: analysisText };
    }
    
    // Store in Supabase if we have an imageId
    if (imageId) {
      const { error } = await supabase
        .from('documents')
        .insert({
          id: `doc_${Date.now()}`,
          content: ocrText,
          metadata: {
            invoiceId: imageId,
            analysis: analysisJson
          }
        });
      
      if (error) {
        console.error('Error saving to Supabase:', error);
      }
    }
    
    return NextResponse.json({
      success: true,
      analysis: analysisJson,
      rawOutput: analysisText
    });
  } catch (error) {
    console.error('Error analyzing invoice:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to analyze invoice' 
    }, { status: 500 });
  }
} 