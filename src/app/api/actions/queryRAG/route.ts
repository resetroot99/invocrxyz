import { NextRequest, NextResponse } from 'next/server';
import { queryDocuments } from '../../../../lib/vector';

export async function POST(req: NextRequest) {
  try {
    const { query, topK = 5 } = await req.json();
    
    // Perform semantic search using the vector store
    const docs = await queryDocuments(query, topK);
    
    return NextResponse.json({ docs });
  } catch (error) {
    console.error('Error querying documents:', error);
    return NextResponse.json(
      { error: 'Failed to query documents' },
      { status: 500 }
    );
  }
} 