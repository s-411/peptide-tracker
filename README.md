# Peptide Tracker

A comprehensive peptide tracking and management system built with Next.js, TypeScript, and Supabase.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 10+
- Git
- Supabase account (for database)
- Clerk account (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd peptide-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp apps/web/.env.local.example apps/web/.env.local
   ```

   Fill in your Supabase and Clerk credentials in `apps/web/.env.local`

4. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

This is a monorepo organized with Turborepo:

```
peptide-tracker/
├── apps/
│   └── web/                    # Next.js application
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   ├── components/     # React components
│       │   └── lib/            # Utility functions
│       └── package.json
├── packages/
│   ├── shared/                 # Shared types and utilities
│   └── ui/                     # Shared UI components
├── docs/                       # Project documentation
├── design-system/              # Design tokens and assets
└── package.json                # Root package.json
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 15+ with React 19+ and TypeScript 5+
- **Styling**: Tailwind CSS 4+ with custom design system
- **Database**: Supabase PostgreSQL
- **Authentication**: Clerk.com
- **Build Tool**: Turborepo for monorepo management
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks
- **Deployment**: Vercel (recommended)

## 🎨 Design System

The project uses a custom design system with:

- **Primary Color**: #ff3427 (red)
- **Theme**: Dark theme by default
- **Typography**: Antonio (headings), Poppins (body text)
- **Components**: Built with Tailwind CSS using design tokens
- **Responsive**: Mobile-first approach

### Design Tokens

Design tokens are defined in:
- `design-system/config/colors.json` - Color palette
- `design-system/config/design-tokens.json` - Typography, spacing, etc.
- `apps/web/src/app/globals.css` - CSS custom properties

## 📝 Available Scripts

### Root Scripts (run from project root)

```bash
npm run dev          # Start all development servers
npm run build        # Build all applications and packages
npm run lint         # Lint all code
npm run type-check   # Type check all TypeScript
npm run format       # Format code with Prettier
npm run test         # Run all tests
```

### Web App Scripts (run from apps/web)

```bash
npm run dev          # Start Next.js development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint web app code
npm run type-check   # Type check web app
```

## 🧪 Testing

Testing setup includes:
- **Framework**: Vitest + Testing Library (to be configured)
- **Structure**: Tests co-located with source files
- **Commands**:
  - `npm run test` - Run all tests
  - `npm run test:watch` - Run tests in watch mode
  - `npm run test:coverage` - Generate coverage reports

## 🌐 Environment Variables

### Required Variables

Create `apps/web/.env.local` with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### Optional Variables

```bash
# Clerk URLs (defaults shown)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## 🔧 Development Workflow

### Code Quality

This project enforces code quality through:

1. **ESLint**: Configured with Next.js and TypeScript rules
2. **Prettier**: Consistent code formatting
3. **TypeScript**: Strict type checking
4. **Husky**: Pre-commit hooks for linting and formatting
5. **lint-staged**: Only lint changed files

### Pre-commit Hooks

Before each commit, the following checks run automatically:
- ESLint with auto-fix
- Prettier formatting
- TypeScript type checking

### VS Code Setup

Recommended VS Code extensions are listed in `.vscode/extensions.json`:
- Prettier (esbenp.prettier-vscode)
- ESLint (dbaeumer.vscode-eslint)
- Tailwind CSS (bradlc.vscode-tailwindcss)
- TypeScript (ms-vscode.vscode-typescript-next)

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Build Configuration

The project is configured for optimal production builds:
- TypeScript compilation
- Tailwind CSS optimization
- Turbopack for fast builds
- Next.js optimization

## 📚 Documentation

- Project documentation is in the `docs/` folder
- Architecture decisions and technical documentation
- Story files for feature development
- API documentation (when available)

## 🤝 Contributing

1. Clone the repository
2. Create a feature branch
3. Make your changes
4. Ensure all tests pass and code is properly formatted
5. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Use the existing design system components
- Write tests for new features
- Ensure accessibility standards
- Follow the established project structure

## 📄 License

[Add your license information here]

## 🆘 Support

For questions and support:
- Check the documentation in the `docs/` folder
- Review existing issues
- Create a new issue for bugs or feature requests

---

**Version**: 0.1.0
**Last Updated**: [Current Date]