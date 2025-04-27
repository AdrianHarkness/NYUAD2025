// Application configuration

// Backend API URL - this should point to your actual backend server
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

// Frontend URL - this is your Vercel deployment URL
export const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://sawty-voting.vercel.app"

// Log configuration on startup
if (typeof window !== "undefined") {
  console.log("App Configuration:", {
    apiUrl: API_URL,
    frontendUrl: FRONTEND_URL,
    environment: process.env.NODE_ENV,
  })
}
