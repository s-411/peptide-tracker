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
    const format = searchParams.get('format') || 'csv';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
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

    // Get comprehensive analytics
    const analytics = await DatabaseService.getComprehensiveAnalytics(userRecord.id, filters);

    if (format === 'csv') {
      // Generate CSV data
      let csvContent = '';

      // Protocol Adherence Section
      csvContent += 'PROTOCOL ADHERENCE\n';
      csvContent += 'Protocol Name,Peptide,Adherence %,Planned Doses,Actual Doses,Missed Doses,Current Streak (days),Longest Streak (days),Consistency Score\n';

      for (const protocol of analytics.protocolAdherence) {
        csvContent += `${protocol.protocolName},${protocol.peptideName},${protocol.adherencePercentage.toFixed(1)},${protocol.totalPlannedDoses},${protocol.actualDoses},${protocol.missedDoses},${protocol.streakDays},${protocol.longestStreak},${protocol.doseConsistencyScore.toFixed(1)}\n`;
      }

      csvContent += '\n';

      // Injection Sites Section
      csvContent += 'INJECTION SITES\n';
      csvContent += 'Location,Side,Usage Count,Usage %,Days Since Last Use,Overused,Needs Rotation\n';

      for (const site of analytics.injectionSites) {
        csvContent += `${site.location},${site.side},${site.usageCount},${site.usagePercentage.toFixed(1)},${site.daysSinceLastUse},${site.overused ? 'Yes' : 'No'},${site.recommendedRotation ? 'Yes' : 'No'}\n`;
      }

      csvContent += '\n';

      // Timing Patterns Section
      csvContent += 'TIMING PATTERNS\n';
      csvContent += `Consistency Score,${analytics.timingPatterns.consistencyScore.toFixed(1)}%\n`;
      csvContent += `Average Time,${analytics.timingPatterns.averageTime}\n`;
      csvContent += `Optimal Window,${analytics.timingPatterns.optimalTimeWindow.start} - ${analytics.timingPatterns.optimalTimeWindow.end}\n`;

      csvContent += '\n';
      csvContent += 'Most Common Times\n';
      csvContent += 'Time,Count\n';
      for (const timeData of analytics.timingPatterns.mostCommonTimes) {
        csvContent += `${timeData.time},${timeData.count}\n`;
      }

      csvContent += '\n';

      // Dose Variance Section
      csvContent += 'DOSE VARIANCE\n';
      csvContent += 'Target Dose (mg),Average Dose (mg),Accuracy %,Standard Deviation,Trend\n';

      for (const variance of analytics.doseVariance) {
        csvContent += `${variance.targetDose.toFixed(2)},${variance.averageDose.toFixed(2)},${variance.accuracyPercentage.toFixed(1)},${variance.standardDeviation.toFixed(2)},${variance.trend}\n`;
      }

      csvContent += '\n';

      // Insights Section
      csvContent += 'KEY INSIGHTS\n';
      for (const insight of analytics.keyInsights) {
        csvContent += `"${insight}"\n`;
      }

      csvContent += '\n';

      // Recommendations Section
      csvContent += 'RECOMMENDATIONS\n';
      for (const recommendation of analytics.recommendations) {
        csvContent += `"${recommendation}"\n`;
      }

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="peptide-analytics.csv"'
        }
      });
    }

    if (format === 'pdf') {
      // For PDF, we'll return a simple text-based report
      // In a real implementation, you'd use a library like puppeteer or jsPDF
      let reportContent = `PEPTIDE TRACKER ANALYTICS REPORT\n`;
      reportContent += `Generated: ${new Date().toLocaleString()}\n`;
      reportContent += `Period: ${analytics.dateRange.start.toLocaleDateString()} - ${analytics.dateRange.end.toLocaleDateString()}\n\n`;

      reportContent += `SUMMARY\n`;
      reportContent += `========\n`;
      const avgAdherence = analytics.protocolAdherence.reduce((sum, p) => sum + p.adherencePercentage, 0) / Math.max(analytics.protocolAdherence.length, 1);
      reportContent += `Average Protocol Adherence: ${avgAdherence.toFixed(1)}%\n`;
      reportContent += `Timing Consistency: ${analytics.timingPatterns.consistencyScore.toFixed(1)}%\n`;
      reportContent += `Injection Sites Used: ${analytics.injectionSites.length}\n`;
      reportContent += `Key Insights: ${analytics.keyInsights.length}\n\n`;

      reportContent += `PROTOCOL ADHERENCE\n`;
      reportContent += `==================\n`;
      for (const protocol of analytics.protocolAdherence) {
        reportContent += `${protocol.protocolName} (${protocol.peptideName}): ${protocol.adherencePercentage.toFixed(1)}% adherence\n`;
        reportContent += `  - ${protocol.actualDoses}/${protocol.totalPlannedDoses} doses completed\n`;
        reportContent += `  - Current streak: ${protocol.streakDays} days\n\n`;
      }

      reportContent += `KEY INSIGHTS\n`;
      reportContent += `============\n`;
      for (const insight of analytics.keyInsights) {
        reportContent += `• ${insight}\n`;
      }

      reportContent += `\nRECOMMENDATIONS\n`;
      reportContent += `===============\n`;
      for (const recommendation of analytics.recommendations) {
        reportContent += `• ${recommendation}\n`;
      }

      return new NextResponse(reportContent, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': 'attachment; filename="peptide-analytics-report.txt"'
        }
      });
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
  } catch (error) {
    console.error('Error in analytics export API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}