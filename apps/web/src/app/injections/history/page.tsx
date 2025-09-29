import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { InjectionHistory } from '@/components/injections/InjectionHistory';

export default async function InjectionHistoryPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  return (
    <div className="min-h-screen bg-dark text-white">
      <header className="bg-dark2 border-b border-gray/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-gray hover:text-white transition-colors"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-h3 font-heading">Injection History</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/injections/log"
              className="bg-primary text-dark px-4 py-2 rounded-button font-bold hover:bg-primary-hover transition-colors"
            >
              Log Injection
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-h4 font-heading text-primary mb-2">Complete Injection Records</h2>
          <p className="text-gray text-small">
            Track and analyze your peptide injection history with powerful filtering and search capabilities.
          </p>
        </div>

        <InjectionHistory />
      </main>
    </div>
  );
}