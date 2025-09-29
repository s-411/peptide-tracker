import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-dark text-white">
      <header className="bg-dark2 border-b border-gray/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-h3 font-heading">Peptide Tracker</h1>
          <div className="flex items-center gap-4">
            <SignedOut>
              <Link
                href="/auth/sign-in"
                className="text-white hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/sign-up"
                className="bg-primary text-dark px-4 py-2 rounded-button font-bold hover:bg-primary-hover transition-colors"
              >
                Sign Up
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="text-white hover:text-primary transition-colors mr-4"
              >
                Dashboard
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                    userButtonPopoverCard: "bg-dark2 border border-gray/20",
                    userButtonPopoverActionButton: "text-white hover:bg-gray/10",
                    userButtonPopoverActionButtonText: "text-white",
                    userButtonPopoverActionButtonIcon: "text-gray",
                  },
                }}
              />
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-h1 font-heading mb-6">
            Track Your Peptides with Precision
          </h1>
          <p className="text-xl text-gray mb-8 max-w-2xl mx-auto">
            A comprehensive peptide tracking and management system designed for researchers,
            health enthusiasts, and professionals who need precise monitoring.
          </p>

          <SignedOut>
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/sign-up"
                className="bg-primary text-dark px-8 py-3 rounded-button font-bold hover:bg-primary-hover transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="/auth/sign-in"
                className="bg-transparent text-white border border-gray px-8 py-3 rounded-button font-bold hover:bg-gray/10 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              className="bg-primary text-dark px-8 py-3 rounded-button font-bold hover:bg-primary-hover transition-colors inline-block"
            >
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>

        <div className="grid gap-8 md:grid-cols-3 mb-12">
          <div className="bg-dark2 p-6 rounded-card border border-gray/20 text-center">
            <div className="text-primary text-4xl mb-4">🧬</div>
            <h3 className="text-h4 font-heading mb-3">Precise Tracking</h3>
            <p className="text-gray">
              Log peptide intake, dosages, and timing with scientific precision and accuracy.
            </p>
          </div>

          <div className="bg-dark2 p-6 rounded-card border border-gray/20 text-center">
            <div className="text-success text-4xl mb-4">📊</div>
            <h3 className="text-h4 font-heading mb-3">Advanced Analytics</h3>
            <p className="text-gray">
              Visualize patterns, trends, and insights from your peptide tracking data.
            </p>
          </div>

          <div className="bg-dark2 p-6 rounded-card border border-gray/20 text-center">
            <div className="text-warning text-4xl mb-4">🔒</div>
            <h3 className="text-h4 font-heading mb-3">Secure & Private</h3>
            <p className="text-gray">
              Your health data is encrypted and protected with enterprise-grade security.
            </p>
          </div>
        </div>

        <div className="bg-dark2 p-8 rounded-card border border-gray/20">
          <h2 className="text-h2 font-heading text-center mb-8">
            Why Choose Peptide Tracker?
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="text-primary">✓</div>
                <div>
                  <h4 className="font-heading text-white mb-1">Scientific Accuracy</h4>
                  <p className="text-gray text-small">Built for precision tracking with detailed logging capabilities.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-primary">✓</div>
                <div>
                  <h4 className="font-heading text-white mb-1">Data Insights</h4>
                  <p className="text-gray text-small">Comprehensive analytics to understand your peptide patterns.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-primary">✓</div>
                <div>
                  <h4 className="font-heading text-white mb-1">Easy to Use</h4>
                  <p className="text-gray text-small">Intuitive interface designed for daily use by professionals.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="text-primary">✓</div>
                <div>
                  <h4 className="font-heading text-white mb-1">Secure Storage</h4>
                  <p className="text-gray text-small">Your data is encrypted and stored with bank-level security.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-primary">✓</div>
                <div>
                  <h4 className="font-heading text-white mb-1">Cross-Platform</h4>
                  <p className="text-gray text-small">Access your data from any device, anywhere, anytime.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-primary">✓</div>
                <div>
                  <h4 className="font-heading text-white mb-1">Export Data</h4>
                  <p className="text-gray text-small">Export your tracking data for analysis or sharing with professionals.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-dark2 border-t border-gray/20 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-gray">
          <p>© 2025 Peptide Tracker. Built for precision health tracking.</p>
        </div>
      </footer>
    </div>
  );
}