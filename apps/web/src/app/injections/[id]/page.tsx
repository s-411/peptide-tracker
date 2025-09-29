import { currentUser } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { DatabaseService } from '@/lib/database';
import { InjectionDetail } from '@/components/injections/InjectionDetail';

interface InjectionDetailPageProps {
  params: {
    id: string;
  };
  searchParams: {
    success?: string;
  };
}

export default async function InjectionDetailPage({
  params,
  searchParams
}: InjectionDetailPageProps) {
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
              href="/injections/history"
              className="text-gray hover:text-white transition-colors"
            >
              ← Back to History
            </Link>
            <h1 className="text-h3 font-heading">Injection Details</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/injections/log"
              className="text-gray hover:text-white transition-colors"
            >
              Log New Injection
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Success Message */}
        {searchParams.success === 'updated' && (
          <div className="bg-success/10 border border-success/30 rounded-card p-4 mb-6">
            <div className="text-success font-medium">
              Injection updated successfully!
            </div>
          </div>
        )}

        <InjectionDetail injection={injection} />
      </main>
    </div>
  );
}