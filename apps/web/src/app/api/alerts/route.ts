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
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const activeOnly = searchParams.get('activeOnly') !== 'false'; // Default to true

    // Get user record to get actual user ID
    const userRecord = await DatabaseService.getUserByClerkId(userId);
    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const alerts = await DatabaseService.getUserAlerts(userRecord.id, unreadOnly, activeOnly);

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Error in alerts GET API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    // Get user record to get actual user ID
    const userRecord = await DatabaseService.getUserByClerkId(userId);
    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    switch (action) {
      case 'calculateAlerts':
        // Run all alert calculations for the user
        const doseAlerts = await DatabaseService.calculateDoseAlerts(userRecord.id);
        const missedDoseAlerts = await DatabaseService.calculateMissedDoseAlerts(userRecord.id);
        const siteRotationAlerts = await DatabaseService.calculateSiteRotationAlerts(userRecord.id);
        const milestoneAlerts = await DatabaseService.calculateProtocolMilestoneAlerts(userRecord.id);

        const totalAlerts = doseAlerts.length + missedDoseAlerts.length + siteRotationAlerts.length + milestoneAlerts.length;

        return NextResponse.json({
          message: `Created ${totalAlerts} new alerts`,
          counts: {
            dose: doseAlerts.length,
            missedDose: missedDoseAlerts.length,
            siteRotation: siteRotationAlerts.length,
            milestones: milestoneAlerts.length
          }
        });

      case 'markRead':
        const { alertId } = body;
        if (!alertId) {
          return NextResponse.json({ error: 'Alert ID required' }, { status: 400 });
        }

        await DatabaseService.markAlertAsRead(userRecord.id, alertId);
        return NextResponse.json({ message: 'Alert marked as read' });

      case 'dismiss':
        const { alertId: dismissAlertId } = body;
        if (!dismissAlertId) {
          return NextResponse.json({ error: 'Alert ID required' }, { status: 400 });
        }

        await DatabaseService.dismissAlert(userRecord.id, dismissAlertId);
        return NextResponse.json({ message: 'Alert dismissed' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in alerts POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}