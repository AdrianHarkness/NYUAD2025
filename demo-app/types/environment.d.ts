declare namespace NodeJS {
  interface ProcessEnv {
    // Vercel KV Configuration
    KV_REST_API_URL: string;
    KV_REST_API_TOKEN: string;
    KV_REST_API_READ_ONLY_TOKEN: string;
    
    // Upstash Redis Configuration
    UPSTASH_REDIS_REST_URL: string;
    UPSTASH_REDIS_REST_TOKEN: string;
    
    // Direct Redis Connection
    REDIS_URL: string;
    
    // Vercel Environment
    VERCEL: string;
    
    // API Base URL
    NEXT_PUBLIC_API_BASE_URL: string;
    
    // Frontend URL
    NEXT_PUBLIC_FRONTEND_URL: string;
    
    // Mailing List
    MAILING_LIST: string;
  }
} 