# Web Application

This is the main Next.js web application for Peptide Tracker.

## 🚀 Getting Started

From the project root:

```bash
npm run dev
```

Or from this directory:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 🏗️ Application Structure

```
apps/web/
├── src/
│   ├── app/                 # App Router pages and layouts
│   │   ├── globals.css      # Global styles and design system
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # React components
│   │   ├── ui/              # Base UI components
│   │   └── features/        # Feature-specific components
│   └── lib/                 # Utility functions and configurations
│       ├── supabase/        # Database client setup
│       ├── auth/            # Authentication utilities
│       └── utils/           # General utilities
├── public/                  # Static assets
├── .env.local.example       # Environment variables template
└── package.json
```

## 🎨 Design System Integration

The web app uses our custom design system:

- **Colors**: Defined in `globals.css` as CSS custom properties
- **Typography**: Antonio (headings) and Poppins (body) from Google Fonts
- **Components**: Built with Tailwind CSS using design tokens
- **Theme**: Dark theme by default with #ff3427 primary color

### Using Design System Classes

```tsx
// Typography
<h1 className="text-h1 font-heading">Heading</h1>
<p className="text-body">Body text</p>

// Colors
<div className="bg-dark text-white border-gray/20">
<button className="bg-primary text-dark hover:bg-primary-hover">

// Spacing and Layout
<div className="p-card rounded-card">
<button className="px-button-px py-button-py rounded-button">
```

## 🔧 Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

## 🗄️ Database Integration

The app uses Supabase for the database:

- **Client-side**: Use `src/lib/supabase/client.ts`
- **Server-side**: Use `src/lib/supabase/server.ts`
- **Middleware**: Session handling in `src/lib/supabase/middleware.ts`

### Example Usage

```tsx
// Client component
import { createClient } from '@/lib/supabase/client';

// Server component
import { createClient } from '@/lib/supabase/server';

// In a server component
const supabase = await createClient();
const { data } = await supabase.from('peptides').select('*');
```

## 🔐 Authentication

Authentication is handled by Clerk:

- Sign-in page: `/sign-in`
- Sign-up page: `/sign-up`
- Dashboard: `/dashboard` (protected)

## 📱 Responsive Design

The application is mobile-first and responsive:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

Use Tailwind's responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`

## 🧪 Testing

Tests are located alongside source files:

```
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx
└── lib/
    ├── utils.ts
    └── utils.test.ts
```

Run tests:

```bash
npm run test           # Run tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

## 🚀 Building and Deployment

```bash
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Lint code
npm run type-check  # Type check
```

## 📁 Adding New Features

1. **Create components** in `src/components/`
2. **Add pages** in `src/app/`
3. **Use design system** classes and components
4. **Add types** to shared package if needed
5. **Write tests** for new functionality
6. **Update documentation** as needed

## 🔍 Debugging

- Use React Developer Tools browser extension
- Check browser console for errors
- Use VS Code debugger with launch configuration
- Add `console.log` statements (removed by ESLint in production)

## ⚡ Performance

- Next.js handles most optimizations automatically
- Use `next/image` for images
- Implement code splitting with dynamic imports
- Monitor Core Web Vitals
- Use the built-in performance profiler

---

For more information, see the main project README.