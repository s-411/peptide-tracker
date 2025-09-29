import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DatabaseService } from '@/lib/database';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user record to get actual user ID
    const userRecord = await DatabaseService.getUserByClerkId(userId);
    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const preferences = await DatabaseService.getNotificationPreferences(userRecord.id);

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error in notification preferences GET API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { preferences } = body;

    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json({ error: 'Invalid preferences data' }, { status: 400 });
    }

    // Get user record to get actual user ID
    const userRecord = await DatabaseService.getUserByClerkId(userId);
    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const success = await DatabaseService.updateNotificationPreferences(userRecord.id, preferences);

    if (!success) {
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Error in notification preferences PUT API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}