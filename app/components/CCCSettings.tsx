'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Define types
interface WebhookConfig {
  id?: string;
  ccc_id: string;
  marketplace_id: string;
  endpoint: string;
  secret: string;
  enabled: boolean;
}

export default function CCCSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form fields
  const [cccId, setCccId] = useState('');
  const [marketplaceId, setMarketplaceId] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [secret, setSecret] = useState('');
  
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Fetch existing webhooks
  useEffect(() => {
    const fetchWebhooks = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/webhooks');
        const data = await response.json();
        
        if (data.success) {
          setWebhooks(data.webhooks || []);
        } else {
          setError(data.error || 'Failed to fetch webhooks');
        }
      } catch (err) {
        setError('Error fetching webhook configurations');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWebhooks();
  }, []);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ccc_id: cccId,
          marketplace: marketplaceId,
          config: {
            endpoint,
            secret,
            marketplace_id: marketplaceId
          }
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Webhook configuration saved successfully!');
        // Add the new webhook to the list or update existing
        const updatedWebhooks = [...webhooks];
        const existingIndex = updatedWebhooks.findIndex(w => w.ccc_id === cccId);
        
        if (existingIndex >= 0) {
          updatedWebhooks[existingIndex] = data.webhook;
        } else {
          updatedWebhooks.push(data.webhook);
        }
        
        setWebhooks(updatedWebhooks);
        
        // Reset form
        setCccId('');
        setMarketplaceId('');
        setEndpoint('');
        setSecret('');
      } else {
        setError(data.error || 'Failed to save webhook configuration');
      }
    } catch (err) {
      setError('Error saving webhook configuration');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-6">CCC SecureShare Configuration</h2>
      
      {/* Status messages */}
      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-500 text-white p-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {/* Configuration form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-400 mb-1">CCC ID</label>
          <input
            type="text"
            value={cccId}
            onChange={(e) => setCccId(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
            placeholder="Your CCC ID"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-400 mb-1">Marketplace ID</label>
          <input
            type="text"
            value={marketplaceId}
            onChange={(e) => setMarketplaceId(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
            placeholder="Marketplace Identifier"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-400 mb-1">Webhook Endpoint</label>
          <input
            type="url"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
            placeholder="https://your-webhook-endpoint.com/ccc"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-400 mb-1">Secret Key</label>
          <input
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
            placeholder="Webhook secret key"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>
      
      {/* Existing webhooks */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Existing Configurations</h3>
        
        {webhooks.length === 0 ? (
          <p className="text-gray-400">No webhook configurations found.</p>
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="border border-gray-700 rounded p-4 bg-gray-700">
                <p><span className="font-semibold">CCC ID:</span> {webhook.ccc_id}</p>
                <p><span className="font-semibold">Marketplace:</span> {webhook.marketplace_id}</p>
                <p><span className="font-semibold">Endpoint:</span> {webhook.endpoint}</p>
                <p>
                  <span className="font-semibold">Status:</span>
                  <span className={webhook.enabled ? "text-green-400 ml-2" : "text-red-400 ml-2"}>
                    {webhook.enabled ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 