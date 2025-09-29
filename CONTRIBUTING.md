# Contributing to Peptide Tracker

Thank you for your interest in contributing to Peptide Tracker! This guide will help you get started.

## 🏗️ Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/peptide-tracker.git
   cd peptide-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp apps/web/.env.local.example apps/web/.env.local
   # Fill in your Supabase and Clerk credentials
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

## 📋 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Write or update tests as needed
   - Update documentation if required

3. **Verify your changes**
   ```bash
   npm run lint        # Check code style
   npm run type-check  # Check TypeScript
   npm run test        # Run tests
   npm run build       # Ensure build works
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## 🎨 Code Style

### TypeScript
- Use strict TypeScript configuration
- Prefer `interface` over `type` for object shapes
- Use explicit return types for functions
- Avoid `any` type - use proper typing

### React Components
- Use functional components with hooks
- Prefer named exports
- Use proper TypeScript props interfaces
- Follow the existing component structure

### CSS/Styling
- Use Tailwind CSS classes
- Follow the design system tokens
- Avoid custom CSS unless necessary
- Use semantic color names from design system

## 🧪 Testing

- Write unit tests for utility functions
- Add component tests for UI components
- Test user interactions and edge cases
- Maintain good test coverage

## 📁 Project Structure

```
peptide-tracker/
├── apps/web/           # Main Next.js application
├── packages/shared/    # Shared utilities and types
├── packages/ui/        # Shared UI components
├── docs/              # Documentation
└── design-system/     # Design tokens and assets
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment**: OS, Node.js version, browser
2. **Steps to reproduce**: Clear step-by-step instructions
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Screenshots**: If applicable

## 💡 Feature Requests

For feature requests:

1. **Check existing issues** to avoid duplicates
2. **Describe the problem** the feature would solve
3. **Provide use cases** and examples
4. **Consider implementation** if you have ideas

## 🔒 Security

If you discover a security vulnerability:

1. **Do NOT** create a public issue
2. Email security concerns to [security contact]
3. Include details of the vulnerability
4. Allow time for the issue to be addressed

## 📞 Getting Help

- Check the README and documentation first
- Search existing issues
- Ask questions in discussions
- Join our community channels (if available)

Thank you for contributing! 🎉