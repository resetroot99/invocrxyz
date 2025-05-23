# InvOCR Lite Installation Instructions

## Project Structure

The complete project contains the following structure:

```
invocrxyz/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── actions/
│   │   │   │   ├── analyze/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── indexImage/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── postInvoice/
│   │   │   │   │   └── route.ts
│   │   │   │   └── queryRAG/
│   │   │   │       └── route.ts
│   │   │   └── webhooks/
│   │   │       └── ccc/
│   │   │           └── route.ts
│   │   ├── chat/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ChatBubble.tsx
│   │   └── ChatInput.tsx
│   └── lib/
│       ├── supabase.ts
│       └── vector.ts
├── .env.local
├── .gitignore
└── README.md
```

## Installation Steps

1. Clone your repository and navigate to the project folder
2. Install dependencies with `npm install`
3. Create a `.env.local` file with proper environment variables (see README.md)
4. Run the development server with `npm run dev`
5. Access the application at http://localhost:3000

## Troubleshooting

If you encounter type errors related to missing type declarations, install them with:

```bash
npm install @types/tesseract.js @types/xml2js --save-dev
```

## Development

The key files and their purposes:

1. **Chat Interface**:
   - `src/app/chat/page.tsx` - Main chat UI
   - `src/components/ChatBubble.tsx` - Individual chat message component
   - `src/components/ChatInput.tsx` - Input with camera integration

2. **API Endpoints**:
   - `src/app/api/actions/analyze/route.ts` - OCR and AI analysis
   - `src/app/api/actions/indexImage/route.ts` - Vector store indexing
   - `src/app/api/actions/postInvoice/route.ts` - CCC API integration
   - `src/app/api/actions/queryRAG/route.ts` - Semantic search
   - `src/app/api/webhooks/ccc/route.ts` - CCC webhook handler

3. **Utilities**:
   - `src/lib/supabase.ts` - Supabase client
   - `src/lib/vector.ts` - Vector store utilities

Follow the code pattern for any extensions you wish to make to the application.

## Deployment

Deploy to Vercel by connecting your GitHub repository and configuring environment variables in the Vercel dashboard. 