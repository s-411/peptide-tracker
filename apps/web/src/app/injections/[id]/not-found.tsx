import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function InjectionNotFound() {
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
            <h1 className="text-h3 font-heading">Injection Not Found</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray mx-auto mb-4" />
          <h2 className="text-h3 font-heading text-white mb-4">
            Injection Record Not Found
          </h2>
          <p className="text-gray mb-6">
            The injection record you&rsquo;re looking for doesn&rsquo;t exist or you don&rsquo;t have permission to view it.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/injections/history"
              className="bg-primary text-dark px-4 py-2 rounded-button font-bold hover:bg-primary-hover transition-colors"
            >
              View All Injections
            </Link>
            <Link
              href="/injections/log"
              className="bg-transparent text-white border border-gray px-4 py-2 rounded-button hover:bg-gray/10 transition-colors"
            >
              Log New Injection
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}