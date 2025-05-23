'use client';

import React, { useState, useEffect } from 'react';
import ChatBubble from '../../components/ChatBubble';
import ChatInput from '../../components/ChatInput';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Message interface for typed messages
interface Message {
  role: 'user' | 'system';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const supabase = createClientComponentClient();

  // Subscribe to webhook events via Supabase real-time
  useEffect(() => {
    // Welcome message
    setMessages([
      { 
        role: 'system', 
        content: 'Welcome to InvOCR! You can upload invoice images or use these commands:\n- search [query]: Search your invoice database\n- post [id]: Post an invoice to CCC' 
      }
    ]);

    // Set up realtime subscription
    const channel = supabase
      .channel('ccc-webhooks')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'invoices' 
        }, 
        payload => {
          setMessages(m => [
            ...m, 
            { 
              role: 'system', 
              content: `CCC Event: ${payload.new.ccc_status} for ID ${payload.new.id}` 
            }
          ]);
        }
      )
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleSend = async (input: { text?: string; fileUrl?: string }) => {
    if (input.text) {
      // Add user message to chat
      setMessages(m => [...m, { role: 'user', content: input.text! }]);
      
      // Handle search command
      if (input.text.startsWith('search ')) {
        const query = input.text.slice(7);
        try {
          const response = await fetch('/api/actions/queryRAG', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
          });
          
          if (!response.ok) throw new Error('Search failed');
          
          const { docs } = await response.json();
          setMessages(m => [
            ...m, 
            { 
              role: 'system', 
              content: docs.length 
                ? `Found ${docs.length} results:\n${JSON.stringify(docs, null, 2)}`
                : 'No results found for your query.' 
            }
          ]);
        } catch (error) {
          console.error('Search error:', error);
          setMessages(m => [...m, { role: 'system', content: 'Error searching documents.' }]);
        }
      } 
      // Handle post command
      else if (input.text.startsWith('post ')) {
        const [_, id] = input.text.split(' ');
        if (!id) {
          setMessages(m => [...m, { role: 'system', content: 'Please provide an estimate ID.' }]);
          return;
        }
        
        try {
          // Simple XML template - in a real app, this would be more complex
          const xml = `<VehicleDamageEstimateAddInvoiceRq>
            <DocumentInfo>
              <DocumentID>${id}</DocumentID>
            </DocumentInfo>
          </VehicleDamageEstimateAddInvoiceRq>`;
          
          const response = await fetch('/api/actions/postInvoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estimateId: id, xml })
          });
          
          const { success, error } = await response.json();
          setMessages(m => [
            ...m, 
            { 
              role: 'system', 
              content: success ? 'Invoice posted successfully.' : `Post failed: ${error}` 
            }
          ]);
        } catch (error) {
          console.error('Post error:', error);
          setMessages(m => [...m, { role: 'system', content: 'Error posting invoice.' }]);
        }
      } 
      // Handle regular messages
      else {
        setMessages(m => [
          ...m, 
          { 
            role: 'system', 
            content: 'I can help with invoice-related tasks. Try uploading an image or using a command.' 
          }
        ]);
      }
    } 
    // Handle image upload
    else if (input.fileUrl) {
      setMessages(m => [...m, { role: 'user', content: '📸 Image uploaded' }]);
      
      try {
        // First, index the image in our vector store
        const invoiceId = `inv_${Date.now()}`;
        await fetch('/api/actions/indexImage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceId, imageUrl: input.fileUrl })
        });
        
        // Then, analyze the image with OCR + AI
        const analyzeResponse = await fetch('/api/actions/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: input.fileUrl })
        });
        
        const { summary, text } = await analyzeResponse.json();
        
        // Display AI summary
        setMessages(m => [
          ...m,
          { role: 'system', content: `📄 **Invoice Analysis**\n\n${summary}` }
        ]);
      } catch (error) {
        console.error('Image processing error:', error);
        setMessages(m => [
          ...m, 
          { role: 'system', content: 'Error processing image. Please try again.' }
        ]);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-black text-white p-4">
        <h1 className="text-xl font-bold">InvOCR</h1>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((msg, i) => (
          <ChatBubble key={i} role={msg.role} text={msg.content} />
        ))}
      </div>
      
      <ChatInput onSend={handleSend} />
    </div>
  );
} 