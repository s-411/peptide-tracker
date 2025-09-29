import { currentUser } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { DatabaseService } from '@/lib/database';
import { InjectionEditForm } from '@/components/injections/InjectionEditForm';

interface InjectionEditPageProps {
  params: {
    id: string;
  };
}

export default async function InjectionEditPage({ params }: InjectionEditPageProps) {
  const user = await currentUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Get user's current record
  const userRecord = await DatabaseService.getUserByClerkId(user.id);
  if (!userRecord) {
    redirect('/auth/sign-in');
  }

  // Get the injection
  const injection = await DatabaseService.getInjectionById(params.id, userRecord.id);
  if (!injection) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-dark text-white">
      <header className="bg-dark2 border-b border-gray/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/injections/${params.id}`}
              className="text-gray hover:text-white transition-colors"
            >
              ← Back to Details
            </Link>
            <h1 className="text-h3 font-heading">Edit Injection</h1>
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
            <h2 className="text-h4 font-heading text-primary mb-2">Update Injection Record</h2>
            <p className="text-gray text-small">
              Modify the injection details below. Changes will be tracked with timestamps.
            </p>
          </div>
          <InjectionEditForm injection={injection} />
        </div>
      </main>
    </div>
  );
}