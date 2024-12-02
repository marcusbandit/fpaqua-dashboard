import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    return NextResponse.next();
}
