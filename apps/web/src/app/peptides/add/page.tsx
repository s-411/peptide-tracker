import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PeptideForm } from '@/components/peptides/PeptideForm';

export default async function AddPeptidePage() {
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
              href="/peptides"
              className="text-gray hover:text-white transition-colors"
            >
              ← Back to Library
            </Link>
            <h1 className="text-h3 font-heading">Add New Peptide</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-dark2 p-6 rounded-card border border-gray/20">
          <PeptideForm mode="create" />
        </div>
      </main>
    </div>
  );
}