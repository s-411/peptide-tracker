'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import {
  Home,
  Syringe,
  FlaskConical,
  History,
  FileText,
  BarChart3,
  User,
  Plus
} from 'lucide-react';

interface NavigationProps {
  userId: string;
  userEmail?: string;
}

export function Navigation({ userId, userEmail }: NavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/peptides', label: 'Peptides', icon: FlaskConical },
    { href: '/dashboard/protocols', label: 'Protocols', icon: FileText },
    { href: '/injections/log', label: 'Log', icon: Plus },
    { href: '/injections/history', label: 'History', icon: History },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <header className="bg-dark2 border-b border-gray/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Syringe className="w-6 h-6 text-primary" />
              <span className="text-xl font-heading text-white">Peptide Tracker</span>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/20 text-primary'
                      : 'text-gray hover:text-white hover:bg-gray/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <span className="hidden lg:block text-sm text-gray">
              {userEmail}
            </span>
            <NotificationBell userId={userId} />
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
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-primary/20 text-primary'
                      : 'text-gray hover:text-white hover:bg-gray/10'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}