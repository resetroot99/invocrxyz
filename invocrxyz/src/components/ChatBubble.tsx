'use client';

import React from 'react';

interface ChatBubbleProps {
  role: 'user' | 'system';
  text: string;
}

export default function ChatBubble({ role, text }: ChatBubbleProps) {
  const isUser = role === 'user';
  
  return (
    <div 
      className={`my-2 p-3 rounded-lg max-w-[80%] ${
        isUser 
          ? 'ml-auto bg-blue-500 text-white' 
          : 'mr-auto bg-gray-200 text-gray-800'
      }`}
    >
      <div className="text-sm font-semibold mb-1">
        {isUser ? 'You' : 'AI Assistant'}
      </div>
      <div className="whitespace-pre-wrap">
        {text}
      </div>
    </div>
  );
} 