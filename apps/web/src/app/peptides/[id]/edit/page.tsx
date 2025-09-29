import { currentUser } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { PeptideForm } from '@/components/peptides/PeptideForm';
import { DatabaseService } from '@/lib/database';

interface EditPeptidePageProps {
  params: { id: string };
}

export default async function EditPeptidePage({ params }: EditPeptidePageProps) {
  const user = await currentUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Get user's current record
  const userRecord = await DatabaseService.getUserByClerkId(user.id);
  if (!userRecord) {
    redirect('/auth/sign-in');
  }

  // Get user's peptides to find the one to edit
  const peptides = await DatabaseService.getUserPeptides(userRecord.id);
  const peptide = peptides.find(p => p.id === params.id);

  if (!peptide) {
    notFound();
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
            <h1 className="text-h3 font-heading">Edit {peptide.name}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-dark2 p-6 rounded-card border border-gray/20">
          <PeptideForm mode="edit" peptide={peptide} />
        </div>
      </main>
    </div>
  );
}