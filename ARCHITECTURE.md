# Project Architecture

This document outlines the architecture and folder structure of the Peptide Tracker project.

## 📁 Monorepo Structure

```
peptide-tracker/
├── apps/
│   └── web/                    # Next.js web application
├── packages/
│   ├── shared/                 # Shared types and utilities
│   └── ui/                     # Shared UI components
├── docs/                       # Project documentation
├── design-system/              # Design tokens and assets
├── .bmad-core/                 # BMAD framework files (local only)
└── package.json                # Root package.json with workspaces
```

## 🏗️ Application Structure (apps/web)

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css         # Global styles and design system
│   │   ├── layout.tsx          # Root layout component
│   │   ├── page.tsx            # Home page
│   │   ├── dashboard/          # Dashboard pages
│   │   └── (auth)/             # Authentication route group
│   │       ├── sign-in/
│   │       └── sign-up/
│   ├── components/             # React components
│   │   ├── ui/                 # Base UI components (buttons, inputs, etc.)
│   │   │   ├── index.ts        # Barrel export
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Card.tsx
│   │   └── features/           # Feature-specific components
│   │       ├── index.ts        # Barrel export
│   │       ├── auth/           # Authentication components
│   │       ├── peptides/       # Peptide-related components
│   │       └── dashboard/      # Dashboard components
│   ├── lib/                    # Utilities and configurations
│   │   ├── supabase/           # Database client setup
│   │   │   ├── client.ts       # Browser client
│   │   │   ├── server.ts       # Server client
│   │   │   └── middleware.ts   # Session handling
│   │   ├── auth/               # Authentication utilities
│   │   │   └── index.ts        # Auth types and utilities
│   │   └── utils/              # General utilities
│   │       └── index.ts        # Utility functions
│   └── types/                  # TypeScript type definitions
│       └── index.ts            # Application-specific types
├── public/                     # Static assets
│   ├── icons/
│   └── images/
├── .env.local.example          # Environment variables template
├── .env.local                  # Environment variables (git-ignored)
├── eslint.config.mjs           # ESLint configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Package dependencies and scripts
├── postcss.config.mjs          # PostCSS configuration
├── README.md                   # Application documentation
├── tailwind.config.ts          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

## 📦 Packages Structure

### packages/shared
```
packages/shared/
├── src/
│   ├── types/                  # Shared TypeScript types
│   │   └── index.ts            # User, Peptide, etc.
│   ├── utils/                  # Shared utility functions
│   │   └── index.ts            # Date formatting, etc.
│   └── index.ts                # Main export file
├── package.json
└── tsconfig.json
```

### packages/ui
```
packages/ui/
├── src/
│   ├── components/             # Shared UI components
│   │   └── Button.tsx          # Example button component
│   └── index.tsx               # Main export file
├── package.json
└── tsconfig.json
```

## 🎯 Path Aliases

The following TypeScript path aliases are configured:

- `@/*` → `./src/*` (base source directory)
- `@/components/*` → `./src/components/*` (components)
- `@/lib/*` → `./src/lib/*` (utilities and configurations)
- `@/app/*` → `./src/app/*` (App Router pages)
- `@/ui/*` → `./src/components/ui/*` (UI components)
- `@/features/*` → `./src/components/features/*` (feature components)
- `@/utils/*` → `./src/lib/utils/*` (utility functions)
- `@/shared/*` → `../../packages/shared/src/*` (shared package)
- `@/ui-components/*` → `../../packages/ui/src/*` (UI package)

## 🔧 Import Conventions

### Component Imports
```tsx
// UI components
import { Button, Input, Card } from '@/ui';

// Feature components
import { PeptideList, AuthForm } from '@/features';

// Shared package components
import { Button as SharedButton } from '@/ui-components';
```

### Utility Imports
```tsx
// Local utilities
import { cn, formatDate } from '@/utils';

// Shared utilities
import { formatDate } from '@/shared';

// Library configurations
import { createClient } from '@/lib/supabase/client';
```

## 🗄️ Data Flow Architecture

### Client-Side Data Flow
1. **Components** → Use hooks or direct client calls
2. **Supabase Client** → Browser-based database operations
3. **State Management** → React state or Zustand (when added)
4. **UI Updates** → React re-renders

### Server-Side Data Flow
1. **Server Components** → Direct database access
2. **Supabase Server Client** → Server-side database operations
3. **API Routes** → REST endpoints for complex operations
4. **Middleware** → Session handling and authentication

## 🎨 Design System Integration

### Component Hierarchy
1. **Design Tokens** (CSS custom properties)
2. **Base UI Components** (`@/ui`) - styled with design tokens
3. **Feature Components** (`@/features`) - composed from UI components
4. **Page Components** (`@/app`) - composed from feature components

### Styling Approach
- **Tailwind CSS** for utility-first styling
- **CSS Custom Properties** for design tokens
- **Component-specific** styles when needed
- **Responsive design** with mobile-first approach

## 🔐 Authentication Flow

### Clerk Integration
1. **Middleware** → Session validation on protected routes
2. **Auth Components** → Sign-in/sign-up forms
3. **Protected Routes** → Automatic redirects for unauthenticated users
4. **User Context** → Access user data throughout the app

### Database Integration
1. **User Creation** → Clerk webhook creates user in Supabase
2. **User Data** → Stored in Supabase users table
3. **Authorization** → Row-level security policies
4. **Data Access** → User-scoped queries

## 🧪 Testing Strategy

### Test Structure
```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx     # Component tests
│   └── features/
│       ├── auth/
│       │   ├── AuthForm.tsx
│       │   └── AuthForm.test.tsx
├── lib/
│   ├── utils/
│   │   ├── index.ts
│   │   └── index.test.ts       # Utility tests
│   └── supabase/
│       ├── client.ts
│       └── client.test.ts      # Integration tests
└── app/
    ├── page.tsx
    └── page.test.tsx           # Page tests
```

### Testing Approach
- **Unit Tests** → Individual functions and components
- **Integration Tests** → Database operations and API calls
- **E2E Tests** → User workflows and critical paths
- **Visual Tests** → Component rendering and styling

## 🚀 Build and Deployment

### Build Process
1. **TypeScript Compilation** → Type checking and transpilation
2. **Tailwind CSS** → Style processing and optimization
3. **Next.js Build** → Static generation and optimization
4. **Turbo Build** → Monorepo build orchestration

### Deployment Pipeline
1. **Development** → Local development server
2. **Staging** → Preview deployments on Vercel
3. **Production** → Main branch deployment to Vercel
4. **Database** → Supabase production instance

---

This architecture provides a scalable, maintainable foundation for the Peptide Tracker application while following modern React and Next.js best practices.