import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DatabaseService } from '@/lib/database';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

export default async function AnalyticsPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Get user record
  const userRecord = await DatabaseService.getUserByClerkId(user.id);
  if (!userRecord) {
    redirect('/auth/sign-in');
  }

  return (
    <div className="min-h-screen bg-dark text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnalyticsDashboard userId={userRecord.id} />
      </div>
    </div>
  );
}