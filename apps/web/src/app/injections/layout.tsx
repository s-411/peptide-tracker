import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DatabaseService } from '@/lib/database';
import { Navigation } from '@/components/layout/Navigation';

export default async function InjectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <div className="min-h-screen bg-dark text-white">
      <Navigation
        userId={userRecord.id}
        userEmail={user.emailAddresses[0].emailAddress}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}