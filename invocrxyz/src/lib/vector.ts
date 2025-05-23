import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const vectorClient = createClient(
  process.env.VECTOR_DB_URL!,
  process.env.VECTOR_DB_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export async function upsertDocument(id: string, content: string, metadata: any) {
  const embedding = await openai.embeddings.create({
    model: process.env.EMBEDDING_MODEL!,
    input: content
  });
  const vector = embedding.data[0].embedding;
  await vectorClient.from('documents').upsert([{ id, content, metadata, embedding: vector }]);
}

export async function queryDocuments(query: string, topK = 5) {
  const embedding = await openai.embeddings.create({
    model: process.env.EMBEDDING_MODEL!,
    input: query
  });
  const vector = embedding.data[0].embedding;
  const { data } = await vectorClient.rpc('match_documents', { query_embedding: vector, match_count: topK });
  return data;
} 