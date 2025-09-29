import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { DatabaseService } from '@/lib/database';
import { WeeklySummaryWidget } from '@/components/dashboard/WeeklySummaryWidget';
import { WeeklyProgressWidget } from '@/components/dashboard/WeeklyProgressWidget';
import { AlertsWidget } from '@/components/dashboard/AlertsWidget';
import { Plus, History, BarChart3, FlaskConical, FileText, Target } from 'lucide-react';

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Get user's current record
  const userRecord = await DatabaseService.getUserByClerkId(user.id);
  if (!userRecord) {
    redirect('/auth/sign-in');
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-h2 font-heading text-white mb-2">
          Welcome back, {user.firstName || user.emailAddresses[0].emailAddress}!
        </h1>
        <p className="text-gray">
          Track your peptide protocols, monitor progress, and analyze your data.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/injections/log"
          className="bg-dark2 p-4 rounded-card border border-gray/20 hover:border-primary/50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg group-hover:bg-primary/30 transition-colors">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-white">Log Injection</h3>
              <p className="text-sm text-gray">Quick log entry</p>
            </div>
          </div>
        </Link>

        <Link
          href="/peptides"
          className="bg-dark2 p-4 rounded-card border border-gray/20 hover:border-success/50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-success/20 p-2 rounded-lg group-hover:bg-success/30 transition-colors">
              <FlaskConical className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-medium text-white">Peptides</h3>
              <p className="text-sm text-gray">Manage library</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/protocols"
          className="bg-dark2 p-4 rounded-card border border-gray/20 hover:border-warning/50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-warning/20 p-2 rounded-lg group-hover:bg-warning/30 transition-colors">
              <FileText className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h3 className="font-medium text-white">Protocols</h3>
              <p className="text-sm text-gray">View protocols</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/analytics"
          className="bg-dark2 p-4 rounded-card border border-gray/20 hover:border-secondary/50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-secondary/20 p-2 rounded-lg group-hover:bg-secondary/30 transition-colors">
              <BarChart3 className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-medium text-white">Analytics</h3>
              <p className="text-sm text-gray">View insights</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Dashboard Widgets */}
      <div className="grid gap-6 lg:grid-cols-2">
        <WeeklySummaryWidget userId={userRecord.id} />
        <WeeklyProgressWidget userId={userRecord.id} />
      </div>

      {/* Alerts Widget */}
      <AlertsWidget userId={userRecord.id} />

      {/* Getting Started Guide */}
      <div className="bg-dark2 p-6 rounded-card border border-gray/20">
        <h2 className="text-h3 font-heading mb-4">Getting Started Guide</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                1
              </div>
              <h3 className="font-medium text-white">Add Peptides</h3>
            </div>
            <p className="text-sm text-gray ml-10">
              Start by adding peptides to your library from templates or create custom ones.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center text-success font-bold">
                2
              </div>
              <h3 className="font-medium text-white">Create Protocols</h3>
            </div>
            <p className="text-sm text-gray ml-10">
              Set up your dosing protocols with frequency and timing preferences.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center text-warning font-bold">
                3
              </div>
              <h3 className="font-medium text-white">Log Injections</h3>
            </div>
            <p className="text-sm text-gray ml-10">
              Track each injection with dose, site, and timing information.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center text-secondary font-bold">
                4
              </div>
              <h3 className="font-medium text-white">Monitor Progress</h3>
            </div>
            <p className="text-sm text-gray ml-10">
              Review analytics to track adherence and optimize your protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}