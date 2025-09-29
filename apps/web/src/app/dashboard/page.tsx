import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  return (
    <div className="min-h-screen bg-dark text-white">
      <header className="bg-dark2 border-b border-gray/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-h3 font-heading">Peptide Tracker Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray">
              Welcome, {user.firstName || user.emailAddresses[0].emailAddress}
            </span>
            <Link
              href="/peptides"
              className="text-gray hover:text-white transition-colors"
            >
              Peptides
            </Link>
            <Link
              href="/injections/log"
              className="text-gray hover:text-white transition-colors"
            >
              Log Injection
            </Link>
            <Link
              href="/injections/history"
              className="text-gray hover:text-white transition-colors"
            >
              History
            </Link>
            <Link
              href="/profile"
              className="text-gray hover:text-white transition-colors"
            >
              Profile
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                  userButtonPopoverCard: "bg-dark2 border border-gray/20",
                  userButtonPopoverActionButton: "text-white hover:bg-gray/10",
                  userButtonPopoverActionButtonText: "text-white",
                  userButtonPopoverActionButtonIcon: "text-gray",
                },
              }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-dark2 p-6 rounded-card border border-gray/20">
            <h2 className="text-h4 font-heading mb-4 text-primary">
              Quick Log
            </h2>
            <p className="text-gray mb-4">
              Quickly log your peptide intake and track your progress.
            </p>
            <Link
              href="/injections/log"
              className="bg-primary text-dark px-4 py-2 rounded-button font-bold hover:bg-primary-hover transition-colors inline-block text-center"
            >
              Log Peptide
            </Link>
          </div>

          <div className="bg-dark2 p-6 rounded-card border border-gray/20">
            <h2 className="text-h4 font-heading mb-4 text-success">
              Recent Activity
            </h2>
            <p className="text-gray mb-4">
              View your recent peptide logs and tracking history.
            </p>
            <Link
              href="/injections/history"
              className="bg-transparent text-white border border-gray px-4 py-2 rounded-button font-bold hover:bg-gray/10 transition-colors inline-block text-center"
            >
              View History
            </Link>
          </div>

          <div className="bg-dark2 p-6 rounded-card border border-gray/20">
            <h2 className="text-h4 font-heading mb-4 text-warning">
              Analytics
            </h2>
            <p className="text-gray mb-4">
              Analyze your peptide tracking patterns and trends.
            </p>
            <button className="bg-transparent text-white border border-gray px-4 py-2 rounded-button font-bold hover:bg-gray/10 transition-colors">
              View Analytics
            </button>
          </div>
        </div>

        <div className="mt-8 bg-dark2 p-6 rounded-card border border-gray/20">
          <h2 className="text-h3 font-heading mb-4">Getting Started</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-h5 font-heading text-primary">1. Set Up Your Profile</h3>
              <p className="text-gray text-small">
                Complete your profile information to personalize your tracking experience.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-h5 font-heading text-primary">2. Log Your First Peptide</h3>
              <p className="text-gray text-small">
                Start tracking by logging your first peptide intake.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-h5 font-heading text-primary">3. Review Analytics</h3>
              <p className="text-gray text-small">
                Monitor your progress with detailed analytics and insights.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-h5 font-heading text-primary">4. Set Goals</h3>
              <p className="text-gray text-small">
                Define your tracking goals and monitor your achievement progress.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}