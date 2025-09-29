import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-h2 font-heading text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray">
            Sign in to your Peptide Tracker account
          </p>
        </div>

        <div className="bg-dark2 rounded-card p-6 border border-gray/20">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none p-0",
                headerTitle: "text-white font-heading",
                headerSubtitle: "text-gray",
                socialButtonsBlockButton: "bg-dark border border-gray/30 text-white hover:bg-gray/10",
                formFieldInput: "bg-dark border border-gray/30 text-white placeholder:text-gray/50",
                formButtonPrimary: "bg-primary hover:bg-primary-hover text-dark font-bold",
                footerActionLink: "text-primary hover:text-primary-hover",
                dividerLine: "bg-gray/30",
                dividerText: "text-gray",
                formFieldLabel: "text-white",
                identityPreviewText: "text-white",
                identityPreviewEditButton: "text-primary hover:text-primary-hover",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}