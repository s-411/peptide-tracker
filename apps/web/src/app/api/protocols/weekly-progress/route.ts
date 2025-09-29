import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DatabaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const weekStartParam = searchParams.get('weekStart');
    const includeInterrupts = searchParams.get('includeTrends') === 'true';

    let weekStart: Date | undefined;
    if (weekStartParam) {
      weekStart = new Date(weekStartParam);
      if (isNaN(weekStart.getTime())) {
        return NextResponse.json({ error: 'Invalid weekStart date' }, { status: 400 });
      }
    }

    // Get user record to get actual user ID
    const userRecord = await DatabaseService.getUserByClerkId(userId);
    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const progressData = await DatabaseService.getWeeklyProgress(userRecord.id, weekStart);

    if (!progressData) {
      return NextResponse.json({ error: 'Failed to fetch progress data' }, { status: 500 });
    }

    const response: any = { ...progressData };

    // Include trends if requested
    if (includeInterrupts) {
      const trends = await DatabaseService.getWeeklyProgressTrends(userRecord.id, 6);
      response.trends = trends;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in weekly progress API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}