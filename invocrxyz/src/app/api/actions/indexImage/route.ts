import { NextRequest, NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';
import { upsertDocument } from '../../../../lib/vector';

export async function POST(req: NextRequest) {
  try {
    const { invoiceId, imageUrl } = await req.json();
    
    // Perform OCR on the image
    const { data: { text } } = await Tesseract.recognize(imageUrl, 'eng');
    
    // Store the text and metadata in the vector store
    await upsertDocument(
      `${invoiceId}::${imageUrl}`,
      text,
      { invoiceId, imageUrl, indexed_at: new Date().toISOString() }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error indexing image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to index image' },
      { status: 500 }
    );
  }
} 