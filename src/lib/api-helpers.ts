import { NextResponse } from 'next/server';

export function handleApiError(error: unknown): NextResponse {
  console.error(error);

  if (error instanceof Error && error.message.includes('PermissionDenied')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  // Generic server error for unhandled exceptions
  return NextResponse.json({ error: 'Server error' }, { status: 500 });
}
