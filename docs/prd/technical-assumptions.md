# Technical Assumptions

## Repository Structure: Monorepo

Single repository containing the complete application to streamline development, deployment, and maintenance during the MVP phase. This approach reduces complexity and enables faster iteration while maintaining clear separation of concerns within the codebase.

## Service Architecture

**Monolithic Next.js Application** with clear modular organization leveraging external services for authentication and data storage. The architecture will use Next.js API routes for backend services, Clerk.com for user management and billing, and Supabase for peptide data persistence. This approach enables rapid development while maintaining clear separation between user management (Clerk) and application data (Supabase), with complete data isolation per user account. Database operations will be handled through a dedicated service layer to support future scaling.

## Testing Requirements

**Unit + Integration Testing** approach focusing on critical user flows and data integrity. Emphasis on testing injection logging accuracy, dose calculations, and data export functionality. Manual testing convenience methods will be implemented for rapid validation of user interface interactions and weekly dose monitoring features.

## Additional Technical Assumptions and Requests

- **Frontend Framework:** Next.js 14+ with React 18+ for optimal performance and developer experience
- **Database:** Supabase (PostgreSQL) for robust data persistence with proper indexing for injection history queries and real-time capabilities
- **Authentication & Billing:** Clerk.com for comprehensive user management, authentication, and subscription billing (utilizing their beta billing features)
- **Data Architecture:** User authentication data managed by Clerk.com, with peptide tracking data stored in Supabase and linked via Clerk user IDs for complete account isolation
- **Hosting:** Vercel deployment for seamless Next.js integration and global edge distribution
- **State Management:** React Context/useState for local state, with consideration for Zustand if global state becomes complex
- **UI Framework:** Tailwind CSS for rapid development aligned with existing design system tokens
- **Data Validation:** Zod for runtime type checking and data validation across forms and API endpoints
- **Analytics:** Basic user analytics implementation to track feature usage and inform future development
- **PWA Implementation:** Service workers for offline capability and push notifications for dose reminders
