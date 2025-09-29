import { currentUser } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { PeptideTemplateDetail } from '@/components/peptides/PeptideTemplateDetail';
import { DatabaseService } from '@/lib/database';

interface PeptideTemplateDetailPageProps {
  params: { id: string };
}

export default async function PeptideTemplateDetailPage({ params }: PeptideTemplateDetailPageProps) {
  const user = await currentUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Get peptide templates to find the one to view
  const templates = await DatabaseService.getPeptideTemplates();
  const template = templates.find(t => t.id === params.id);

  if (!template) {
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
            <h1 className="text-h3 font-heading">{template.name}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <PeptideTemplateDetail template={template} />
      </main>
    </div>
  );
}