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
    const analyticsType = searchParams.get('type') || 'comprehensive';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const protocolIds = searchParams.get('protocolIds')?.split(',').filter(Boolean);
    const reportType = searchParams.get('reportType') as 'weekly' | 'monthly' | 'quarterly' | 'custom';

    // Get user record
    const userRecord = await DatabaseService.getUserByClerkId(userId);
    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build filters
    const filters: any = {};

    if (startDate && endDate) {
      filters.dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    } else if (reportType) {
      const now = new Date();
      switch (reportType) {
        case 'weekly':
          filters.dateRange = {
            start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            end: now
          };
          break;
        case 'monthly':
          filters.dateRange = {
            start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            end: now
          };
          break;
        case 'quarterly':
          filters.dateRange = {
            start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
            end: now
          };
          break;
      }
    }

    if (protocolIds && protocolIds.length > 0) {
      filters.protocolIds = protocolIds;
    }

    filters.reportType = reportType;

    // Get analytics based on type
    switch (analyticsType) {
      case 'adherence':
        const adherenceData = await DatabaseService.getProtocolAdherence(userRecord.id, filters);
        return NextResponse.json({ data: adherenceData });

      case 'sites':
        const sitesData = await DatabaseService.getInjectionSiteAnalytics(userRecord.id, filters);
        return NextResponse.json({ data: sitesData });

      case 'timing':
        const timingData = await DatabaseService.getTimingPatternAnalytics(userRecord.id, filters);
        return NextResponse.json({ data: timingData });

      case 'variance':
        const varianceData = await DatabaseService.getDoseVarianceAnalytics(userRecord.id, filters);
        return NextResponse.json({ data: varianceData });

      case 'comprehensive':
      default:
        const comprehensiveData = await DatabaseService.getComprehensiveAnalytics(userRecord.id, filters);
        return NextResponse.json({ data: comprehensiveData });
    }
  } catch (error) {
    console.error('Error in analytics API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}