# InvOCR Lite

A chat-centric application for invoice processing with OCR, AI analysis, and RAG capabilities.

## Features

- **Chat-centric interface:** User-friendly interaction through a modern chat UI
- **Image collection:** Capture invoices via camera or file upload 
- **OCR + AI analysis:** Extract and analyze invoice content automatically
- **RAG integration:** Vector store-based semantic search for invoice data
- **CCC integration:** Post invoices to CCC SecureShare API
- **Webhook handling:** Process two-way CCC events

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (with Vector extension enabled)
- OpenAI API key
- CCC SecureShare credentials (for production use)

### Environment Setup

Create a `.env.local` file with the following variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# CCC Secure Share
CCC_SANDBOX_BASE=https://sandbox-api.cccsecureshare.com
CCC_PROD_BASE=https://api.cccsecureshare.com
CCC_SANDBOX_TOKEN=your-sandbox-token
CCC_PROD_TOKEN=your-prod-token
CCC_WEBHOOK_SECRET=your-webhook-secret

# RAG / Vector Store (Supabase Vector Extension)
VECTOR_DB_URL=your-supabase-url
VECTOR_DB_KEY=your-service-role-key
EMBEDDING_MODEL=text-embedding-3-small
```

### Installation

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to use the application.

## Usage

- **Upload images:** Use the camera button to capture invoices
- **Search:** Type `search [query]` to search previous invoices
- **Post invoice:** Type `post [id]` to submit an invoice to CCC

## Deployment

This application is ready for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in the Vercel dashboard
3. Deploy

## License

MIT 