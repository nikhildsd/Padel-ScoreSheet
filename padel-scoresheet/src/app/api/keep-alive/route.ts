import { NextResponse } from 'next/server';

export async function GET() {
  // Simple endpoint that does nothing but keeps the function warm
  return NextResponse.json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  // Also respond to POST requests
  return NextResponse.json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
}