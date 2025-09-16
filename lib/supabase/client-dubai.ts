import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Dubai-specific optimizations
      db: {
        schema: 'public',
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'x-client-info': 'supabase-js-web',
        },
      },
      // Increase timeouts for UAE networks
      realtime: {
        timeout: 30000,
        heartbeatIntervalMs: 30000,
      }
    }
  )
}

// Add connection retry logic for Dubai networks
export async function createClientWithRetry(maxRetries = 3) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const client = createClient();
      // Test connection
      const { error } = await client.from('experiences').select('count').limit(1);
      if (!error) return client;
    } catch (err) {
      console.warn(`Supabase connection attempt ${retries + 1} failed:`, err);
    }
    
    retries++;
    if (retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    }
  }
  
  throw new Error('Failed to connect to Supabase after multiple attempts');
}
