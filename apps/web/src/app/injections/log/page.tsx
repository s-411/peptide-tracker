import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { InjectionForm } from '@/components/injections/InjectionForm';

export default async function LogInjectionPage() {
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
            <h1 className="text-h3 font-heading">Log Injection</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/injections/history"
              className="text-gray hover:text-white transition-colors"
            >
              View History
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-dark2 p-6 rounded-card border border-gray/20">
          <div className="mb-6">
            <h2 className="text-h4 font-heading text-primary mb-2">Quick Injection Logging</h2>
            <p className="text-gray text-small">
              Quickly log your peptide injection with minimal clicks. All fields marked with * are required.
            </p>
          </div>
          <InjectionForm />
        </div>
      </main>
    </div>
  );
}