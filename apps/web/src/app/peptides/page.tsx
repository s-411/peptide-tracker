import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PeptideLibrary } from '@/components/peptides/PeptideLibrary';

export default async function PeptidesPage() {
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
            <h1 className="text-h3 font-heading">Peptide Library</h1>
          </div>
          <Link
            href="/peptides/add"
            className="bg-primary text-dark px-4 py-2 rounded-button font-bold hover:bg-primary-hover transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Peptide
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <PeptideLibrary />
      </main>
    </div>
  );
}