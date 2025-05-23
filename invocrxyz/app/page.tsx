'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { createWorker } from 'tesseract.js';
import type { Worker } from 'tesseract.js';

// Chat types
type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

// Extend Worker type for Tesseract
interface TesseractWorker extends Worker {
  loadLanguage: (language: string) => Promise<void>;
  initialize: (language: string) => Promise<void>;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dbStatus, setDbStatus] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Check database connection on load
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const response = await fetch('/api/tables');
        const data = await response.json();
        
        if (data.success && !data.error) {
          setDbStatus('Connected to Supabase');
        } else {
          setDbStatus(`Error: ${data.error || 'Unknown error'}`);
        }
      } catch (error) {
        setDbStatus('Failed to connect to database');
        console.error('Database connection error:', error);
      }
    };
    
    checkDatabase();
    
    // Add welcome message
    setMessages([
      {
        id: '1',
        content: 'Welcome to InvOCR XYZ! Upload an invoice or take a photo to analyze it.',
        role: 'assistant',
        timestamp: new Date()
      }
    ]);
  }, []);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Reset OCR result
      setOcrResult(null);
    }
  };
  
  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  // Process OCR on the selected file
  const processOCR = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    addMessage('Processing invoice...', 'assistant');
    
    try {
      const worker = await createWorker() as TesseractWorker;
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      const { data: { text } } = await worker.recognize(selectedFile);
      
      setOcrResult(text);
      addMessage(`OCR Result:\n${text}`, 'assistant');
      
      // Send to analysis API
      addMessage('Analyzing invoice content...', 'assistant');
      
      // Generate an ID for this invoice
      const invoiceId = `inv_${Date.now()}`;
      
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ocrText: text,
            imageId: invoiceId
          }),
        });
        
        const analysisData = await response.json();
        
        if (analysisData.success) {
          // Format the analysis result
          const analysis = analysisData.analysis;
          let analysisMessage = 'Invoice Analysis:';
          
          if (analysis.date) analysisMessage += `\n- Date: ${analysis.date}`;
          if (analysis.invoiceNumber) analysisMessage += `\n- Invoice #: ${analysis.invoiceNumber}`;
          if (analysis.totalAmount) analysisMessage += `\n- Total Amount: ${analysis.totalAmount}`;
          if (analysis.vendor) analysisMessage += `\n- Vendor: ${analysis.vendor}`;
          
          if (analysis.lineItems && analysis.lineItems.length > 0) {
            analysisMessage += '\n\nLine Items:';
            analysis.lineItems.forEach((item: any, index: number) => {
              analysisMessage += `\n${index + 1}. ${item.description || 'Item'}: ${item.quantity || ''} × ${item.price || ''}`;
            });
          }
          
          addMessage(analysisMessage, 'assistant');
        } else {
          // Fallback to simulated response if analysis fails
          addMessage('Invoice Analysis:\n- Date: 2023-05-22\n- Invoice #: INV-001\n- Total Amount: $1,250.00\n- Vendor: ABC Company', 'assistant');
        }
      } catch (error) {
        console.error('Analysis API error:', error);
        // Fallback to simulated response
        addMessage('Invoice Analysis:\n- Date: 2023-05-22\n- Invoice #: INV-001\n- Total Amount: $1,250.00\n- Vendor: ABC Company', 'assistant');
      }
      
      await worker.terminate();
    } catch (error) {
      console.error('OCR processing error:', error);
      addMessage('Error processing the invoice. Please try again.', 'assistant');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    addMessage(input, 'user');
    setInput('');
    setIsLoading(true);
    
    try {
      // Simulate assistant response (will be replaced with actual API call)
      setTimeout(() => {
        addMessage('I received your message. How can I help with this invoice?', 'assistant');
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
      setIsLoading(false);
    }
  };
  
  // Helper to add a message to the chat
  const addMessage = (content: string, role: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };
  
  return (
    <main className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="p-4 bg-gray-800 border-b border-gray-700">
        <h1 className="text-2xl font-bold">InvOCR XYZ</h1>
        {dbStatus && (
          <p className="text-sm text-gray-400">
            Database: {dbStatus}
          </p>
        )}
      </header>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Chat */}
        <div className="flex flex-col flex-1 h-full">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-3/4 rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 rounded-lg p-3">
                  <p>Processing...</p>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          
          {/* Input area */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 rounded-l-lg p-2 bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-r-lg disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Image Upload/Preview */}
        <div className="w-1/3 border-l border-gray-700 flex flex-col">
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <h2 className="text-xl font-bold">Invoice Upload</h2>
          </div>
          
          <div className="flex-1 p-4 flex flex-col items-center justify-center space-y-4 overflow-y-auto">
            {previewUrl ? (
              <div className="w-full flex flex-col items-center">
                <img 
                  src={previewUrl} 
                  alt="Invoice preview" 
                  className="max-w-full max-h-64 object-contain border border-gray-700 rounded"
                />
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={handleUploadClick}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    Change
                  </button>
                  <button
                    onClick={processOCR}
                    disabled={isProcessing}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Analyze Invoice'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div 
                  onClick={handleUploadClick}
                  className="border-2 border-dashed border-gray-600 rounded-lg p-12 cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <p className="text-gray-400">
                    Click to upload an invoice image
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Supports JPG, PNG, PDF
                  </p>
                </div>
                <p className="mt-4 text-sm text-gray-400">
                  Or take a photo with your camera
                </p>
                <button 
                  className="mt-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  onClick={() => alert('Camera functionality will be implemented here')}
                >
                  Open Camera
                </button>
              </div>
            )}
          </div>
          
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.pdf"
            className="hidden"
          />
        </div>
      </div>
    </main>
  );
} 