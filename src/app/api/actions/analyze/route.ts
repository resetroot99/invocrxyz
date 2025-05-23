import { NextRequest, NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    
    // Perform OCR on the image
    const { data: { text } } = await Tesseract.recognize(url, 'eng');
    
    // Use AI to analyze the text
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Summarize invoice fields and identify compliance issues. Extract total amount, date, vendor, service details, and any potential compliance concerns.'
        },
        {
          role: 'user',
          content: text
        }
      ]
    });
    
    const summary = completion.choices[0].message.content;
    
    return NextResponse.json({ summary, text });
  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
} 