import { UserProfile } from '@clerk/nextjs';
import Link from 'next/link';

export default function ProfilePage() {
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
            <h1 className="text-h3 font-heading">Profile Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-dark2 rounded-card border border-gray/20 overflow-hidden">
          <UserProfile
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none",
                navbar: "bg-dark border-r border-gray/20",
                navbarButton: "text-white hover:bg-gray/10",
                navbarButtonIcon: "text-gray",
                pageScrollBox: "bg-transparent",
                page: "bg-transparent",
                headerTitle: "text-white font-heading",
                headerSubtitle: "text-gray",
                formFieldInput: "bg-dark border border-gray/30 text-white placeholder:text-gray/50",
                formButtonPrimary: "bg-primary hover:bg-primary-hover text-dark font-bold",
                formFieldLabel: "text-white",
                identityPreviewText: "text-white",
                identityPreviewEditButton: "text-primary hover:text-primary-hover",
                accordionTriggerButton: "text-white hover:bg-gray/10",
                breadcrumbsItem: "text-gray",
                breadcrumbsItemCurrent: "text-white",
                breadcrumbsItemDivider: "text-gray",
                menuButton: "text-white hover:bg-gray/10",
                menuItem: "text-white hover:bg-gray/10",
                profileSectionTitle: "text-white font-heading",
                profileSectionContent: "text-gray",
                badge: "bg-primary text-dark",
                avatarImagePlaceholder: "bg-gray",
                fileDropAreaBox: "border-gray/30",
                fileDropAreaButtonPrimary: "bg-primary hover:bg-primary-hover text-dark",
                alertText: "text-white",
                alertIcon: "text-primary",
              },
            }}
          />
        </div>
      </main>
    </div>
  );
}