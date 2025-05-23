'use client';

import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface ChatInputProps {
  onSend: (input: { text?: string; fileUrl?: string }) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (isUploading) return;
    
    if (file) {
      setIsUploading(true);
      try {
        const user = await supabase.auth.getUser();
        const userId = user.data.user?.id || 'anonymous';
        const timestamp = Date.now();
        const fileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const path = `${userId}/${timestamp}_${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('invoices')
          .upload(path, file);
          
        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }
        
        const { data } = supabase.storage
          .from('invoices')
          .getPublicUrl(path);
          
        onSend({ fileUrl: data.publicUrl });
      } catch (error) {
        console.error('File upload error:', error);
        alert('Failed to upload image. Please try again.');
      } finally {
        setIsUploading(false);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } else if (text.trim()) {
      onSend({ text: text.trim() });
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 flex flex-col border-t">
      {file && (
        <div className="mb-2 p-2 bg-gray-100 rounded flex items-center">
          <span className="flex-1 truncate text-sm">{file.name}</span>
          <button 
            onClick={() => setFile(null)}
            className="ml-2 text-gray-500 hover:text-red-500"
          >
            &times;
          </button>
        </div>
      )}
      
      <div className="flex items-center">
        <label className="mr-2 p-2 border rounded cursor-pointer hover:bg-gray-100">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={e => e.target.files && setFile(e.target.files[0])}
            className="hidden"
          />
          📷
        </label>
        
        <input
          className="flex-1 p-2 border rounded"
          placeholder={isUploading ? "Uploading..." : "Type a message or command..."}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isUploading}
        />
        
        <button 
          onClick={handleSend}
          disabled={isUploading || (!text.trim() && !file)}
          className={`ml-2 px-4 py-2 rounded ${
            isUploading || (!text.trim() && !file)
              ? 'bg-gray-300 text-gray-500'
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          Send
        </button>
      </div>
    </div>
  );
} 