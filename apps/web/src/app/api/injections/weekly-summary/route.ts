import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { DatabaseService } from '@/lib/database';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's current record
    const userRecord = await DatabaseService.getUserByClerkId(user.id);
    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get weekly summary
    const summary = await DatabaseService.getWeeklySummary(userRecord.id);
    if (!summary) {
      return NextResponse.json({ error: 'Failed to fetch weekly summary' }, { status: 500 });
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}