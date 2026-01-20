import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'API proxy - use direct API URL',
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  });
}
