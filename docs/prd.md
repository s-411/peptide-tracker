# Peptide Tracker Product Requirements Document (PRD)

## Goals and Background Context

### Goals

- Create the best peptide tracking application with superior injection logging capabilities that outperforms generic health apps
- Establish Jay Campbell partnership for instant market penetration and credibility within the peptide community
- Deliver MVP with core peptide tracking features (selection, dosing, injection logging, weekly monitoring, history) within 4-6 months
- Achieve 10-20% adoption from Jay Campbell's engaged audience (10K-20K users) within 6 months
- Build foundation for future AI-powered RAG chatbot and advanced peptide optimization insights
- Generate $50K+ MRR within 12 months through premium subscriptions ($15-25/month)
- Position as the definitive peptide tracking solution and category leader before competitors respond

### Background Context

The peptide therapy market is experiencing rapid mainstream adoption, but users currently rely on inadequate tracking solutions like spreadsheets, basic health apps, or simple notes. Generic health apps like MyFitnessPal and Cronometer lack peptide-specific features such as injection site tracking, cycling protocols, and stacking management. No existing solutions provide AI-powered insights for peptide data optimization or expert-guided protocols.

This creates a massive opportunity for a purpose-built peptide tracking application that leverages Jay Campbell's credibility and engaged community for distribution. The solution will focus first on being the best peptide tracker with exceptional injection logging, weekly dose monitoring, and comprehensive history management, then expand to AI-powered optimization insights. The partnership with Jay Campbell provides instant trust, distribution, and access to a warm market of serious peptide users willing to pay premium prices for expert-backed solutions.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2024-09-29 | 1.0 | Initial PRD creation based on Project Brief and competitive analysis | Claude Code |

## Requirements

### Functional

1. **FR1:** The system shall provide a comprehensive peptide database allowing users to select from pre-configured peptides or add custom peptides with dosing information.

2. **FR2:** The system shall enable users to set up dosing schedules with daily/weekly dose targets (e.g., 2mg Semaglutide weekly) for tracking protocol adherence.

3. **FR3:** The system shall provide quick injection logging functionality capturing time, dose amount, injection site, and optional notes for each injection.

4. **FR4:** The system shall display weekly dose monitoring with visual progress tracking against weekly targets and alert users when approaching or exceeding dose limits.

5. **FR5:** The system shall maintain a comprehensive, filterable injection history table showing all logged injections with search and filtering capabilities by date, peptide, dose, and injection site.

6. **FR6:** The system shall provide a "Last 7 Days Summary" view showing recent dosing activity to help users track weekly protocol compliance.

7. **FR7:** The system shall enable users to export their complete injection history and data in standard formats (CSV, PDF).

8. **FR8:** The system shall support user account creation, authentication, and secure data management with password reset capabilities.

9. **FR9:** The system shall provide responsive web application functionality optimized for both desktop and mobile use with PWA capabilities for offline injection logging.

10. **FR10:** The system shall include Jay Campbell's expert content integration with peptide protocols, safety guidelines, and educational materials accessible within the tracking interface.

### Non Functional

1. **NFR1:** The system shall achieve sub-2 second page load times for all core functionality to ensure quick injection logging.

2. **NFR2:** The system shall support offline injection logging capability with automatic sync when connection is restored.

3. **NFR3:** The system shall implement HIPAA-adjacent health data protection with encrypted data storage and secure user authentication.

4. **NFR4:** The system shall maintain 99.5% uptime to ensure reliable access for daily injection logging.

5. **NFR5:** The system shall support at least 20,000 concurrent users with scalable infrastructure to handle Jay Campbell's audience growth.

6. **NFR6:** The system shall be compatible with modern browsers (Chrome, Safari, Firefox) and provide mobile-responsive design across all screen sizes.

7. **NFR7:** The system shall implement progressive web app (PWA) capabilities for native app-like experience on mobile devices.

8. **NFR8:** The system shall maintain database performance with complex filtering and search operations on large injection history datasets.

## User Interface Design Goals

### Overall UX Vision

The Peptide Tracker will embody a premium, expert-focused experience that combines the precision of professional health tracking with the accessibility needed for daily use. The interface will feel like a specialized tool built by and for peptide experts, emphasizing trust, accuracy, and efficiency. The design will convey Jay Campbell's credibility through subtle branding while maintaining a clean, data-driven aesthetic that appeals to the biohacker mindset.

### Key Interaction Paradigms

- **Quick Logging First:** Primary user flow optimized for rapid injection entry within 30 seconds
- **Progressive Disclosure:** Advanced features accessible but not cluttering the core experience
- **Expert Guidance Integration:** Jay Campbell's protocols and recommendations contextually available
- **Data Visualization Focus:** Clear charts and progress indicators for weekly dose monitoring
- **Mobile-Optimized Interactions:** Touch-friendly inputs and swipe gestures for mobile logging

### Core Screens and Views

- **Dashboard:** Weekly dose progress, recent injections, quick logging access
- **Quick Log Injection:** Streamlined form for rapid injection entry
- **Injection History:** Comprehensive table with filtering, search, and export capabilities
- **Weekly Progress:** Visual tracking of dose targets with alerts and recommendations
- **Peptide Setup:** Configuration of peptides, schedules, and dose targets
- **Profile Settings:** Account management, preferences, and data export
- **Expert Content:** Jay Campbell's protocols, safety guidelines, and educational materials

### Accessibility: WCAG AA

The application will meet WCAG AA standards to ensure accessibility for users with disabilities, including proper color contrast ratios, keyboard navigation, screen reader compatibility, and alternative text for visual elements.

### Branding

The design system implements a sophisticated dark theme with red primary color (#ff3427) that conveys energy and precision. Typography uses Antonio for headings (bold, impactful) and Poppins for body text (clean, readable). The aesthetic emphasizes premium quality and expert credibility while maintaining the approachable feel needed for daily health tracking. Subtle integration of Jay Campbell's branding elements reinforces the partnership without overwhelming the user experience.

### Target Device and Platforms: Web Responsive

Primary focus on responsive web application optimized for both desktop and mobile usage, with PWA capabilities for native app-like experience on mobile devices. The application will adapt seamlessly across screen sizes from mobile phones to desktop monitors.

## Technical Assumptions

### Repository Structure: Monorepo

Single repository containing the complete application to streamline development, deployment, and maintenance during the MVP phase. This approach reduces complexity and enables faster iteration while maintaining clear separation of concerns within the codebase.

### Service Architecture

**Monolithic Next.js Application** with clear modular organization leveraging external services for authentication and data storage. The architecture will use Next.js API routes for backend services, Clerk.com for user management and billing, and Supabase for peptide data persistence. This approach enables rapid development while maintaining clear separation between user management (Clerk) and application data (Supabase), with complete data isolation per user account. Database operations will be handled through a dedicated service layer to support future scaling.

### Testing Requirements

**Unit + Integration Testing** approach focusing on critical user flows and data integrity. Emphasis on testing injection logging accuracy, dose calculations, and data export functionality. Manual testing convenience methods will be implemented for rapid validation of user interface interactions and weekly dose monitoring features.

### Additional Technical Assumptions and Requests

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

## Epic List

Based on the MVP scope and technical requirements, here are the sequential epics that will deliver the Peptide Tracker application:

**Epic 1: Foundation & Core Infrastructure**
Establish project foundation with authentication, database setup, and basic peptide management to enable user accounts and initial peptide tracking capabilities.

**Epic 2: Injection Logging & History Management**
Implement the core value proposition of superior injection logging with comprehensive history tracking and filtering capabilities.

**Epic 3: Weekly Dose Monitoring & Progress Tracking**
Add dose target management and visual progress tracking to help users stay on protocol and demonstrate clear value over basic logging solutions.

**Epic 4: Data Export & Jay Campbell Content Integration**
Complete the MVP with data export capabilities and integrate Jay Campbell's expert content to establish credibility and provide user value beyond basic tracking.

## Epic 1: Foundation & Core Infrastructure

Establish the foundational technical infrastructure including project setup, user authentication, database schema, and basic peptide management capabilities. This epic will deliver a working application with user registration, login, and the ability to manage a personal peptide library, providing the foundation for all subsequent tracking features.

### Story 1.1: Project Setup and Development Environment

As a developer,
I want a properly configured Next.js project with all necessary dependencies and development tools,
so that the team can begin building features efficiently with consistent code quality.

#### Acceptance Criteria

1. Next.js 14+ project created with TypeScript configuration
2. Tailwind CSS integrated with custom design system tokens from colors.json and design-tokens.json
3. Database connection configured for PostgreSQL with proper environment variable management
4. ESLint and Prettier configured for code quality and consistency
5. Git repository initialized with proper .gitignore and README documentation
6. Basic project structure established with clear separation between pages, components, and utilities
7. Development and production build scripts configured and tested

### Story 1.2: User Authentication System

As a potential user,
I want to create an account and securely log into the application,
so that I can access my personal peptide tracking data.

#### Acceptance Criteria

1. User registration form with email, password, and basic profile information
2. Secure login functionality with email and password authentication
3. Password reset capability via email with secure token validation
4. User session management with proper authentication state handling
5. Protected routes that require authentication to access tracking features
6. Secure password hashing and storage following security best practices
7. Basic user profile management for updating account information

### Story 1.3: Database Schema and Core Models

As a developer,
I want well-structured database models for users, peptides, and injections,
so that the application can store and retrieve tracking data efficiently.

#### Acceptance Criteria

1. User model with authentication fields, profile information, and timestamps
2. Peptide model supporting both pre-configured and custom peptides with dosing information
3. Injection model capturing dose, time, injection site, peptide reference, and notes
4. Database migrations and seed data for common peptides
5. Proper foreign key relationships and data integrity constraints
6. Database indexes optimized for common query patterns (user injections, date ranges)
7. Comprehensive data validation at the database level

### Story 1.4: Basic Peptide Management

As a user,
I want to manage my personal peptide library with pre-configured and custom peptides,
so that I can set up the peptides I use for injection tracking.

#### Acceptance Criteria

1. Peptide library interface displaying available peptides with dosing information
2. Add custom peptide functionality with name, typical dosing, and notes
3. Edit existing peptides in personal library with proper validation
4. Delete peptides from personal library with confirmation and dependency checking
5. Search and filter peptides by name or category
6. Pre-populated database with common peptides used by Jay Campbell's audience
7. Peptide details view showing dosing recommendations and usage notes

## Epic 2: Injection Logging & History Management

Implement the core injection logging functionality that represents the primary value proposition of the application. This epic delivers superior injection tracking capabilities with comprehensive history management, positioning the app as clearly better than spreadsheets or generic health apps for peptide users.

### Story 2.1: Quick Injection Logging Interface

As a peptide user,
I want to quickly log my injections with minimal clicks and typing,
so that I can maintain accurate records without disrupting my routine.

#### Acceptance Criteria

1. Streamlined injection logging form accessible from dashboard and navigation
2. Peptide selection dropdown populated from user's peptide library
3. Dose amount input with validation against typical ranges for selected peptide
4. Date and time picker defaulting to current time with easy adjustment
5. Injection site selection from predefined body locations with visual guide
6. Optional notes field for tracking side effects, observations, or protocol changes
7. Form submission creates injection record and returns to appropriate view with success confirmation

### Story 2.2: Injection History Table and Filtering

As a peptide user,
I want to view and search through my complete injection history,
so that I can track patterns, verify doses, and maintain comprehensive records.

#### Acceptance Criteria

1. Comprehensive injection history table showing date, peptide, dose, site, and notes
2. Sorting functionality for all major columns (date, peptide, dose)
3. Date range filtering to view specific time periods
4. Peptide filtering to focus on specific compounds
5. Injection site filtering to track rotation patterns
6. Text search across notes and peptide names
7. Pagination for large datasets with configurable page size
8. Mobile-responsive table design with horizontal scrolling or collapsed view

### Story 2.3: Injection Detail and Edit Capabilities

As a peptide user,
I want to view detailed information about specific injections and correct any logging mistakes,
so that I can maintain accurate records and fix data entry errors.

#### Acceptance Criteria

1. Injection detail view showing complete information including timestamps
2. Edit injection functionality preserving data integrity and audit trail
3. Delete injection capability with confirmation dialog and soft delete option
4. Validation preventing future-dated injections or unrealistic dose amounts
5. Change tracking showing when injections were modified and by whom
6. Bulk selection and operations for managing multiple injections
7. Injection duplication feature for repeated protocols

### Story 2.4: Last 7 Days Summary View

As a peptide user,
I want to see a quick summary of my recent injection activity,
so that I can easily track my current weekly protocol compliance.

#### Acceptance Criteria

1. Dashboard widget showing last 7 days of injection activity
2. Visual timeline or calendar view of recent injections
3. Quick stats showing total doses, unique peptides, and injection sites used
4. Identification of missed doses based on expected protocols
5. Direct links to edit or add injections for specific days
6. Visual indicators for protocol adherence and potential issues
7. Responsive design optimized for both mobile and desktop viewing

## Epic 3: Weekly Dose Monitoring & Progress Tracking

Add intelligent dose tracking and progress monitoring capabilities that help users stay on protocol and demonstrate clear value over basic logging solutions. This epic transforms the app from a simple logging tool into an intelligent tracking system that provides guidance and insights.

### Story 3.1: Dose Target Configuration

As a peptide user,
I want to set weekly and daily dose targets for my peptides,
so that I can track my adherence to prescribed or planned protocols.

#### Acceptance Criteria

1. Dose target setup interface for each peptide in user's library
2. Weekly dose target configuration (e.g., 2mg Semaglutide weekly)
3. Daily dose target option for peptides used on daily schedules
4. Flexible scheduling options (every other day, specific days of week)
5. Multiple active protocols support for peptide stacking
6. Start and end date configuration for cycling protocols
7. Protocol templates based on Jay Campbell's recommended schedules

### Story 3.2: Weekly Progress Dashboard

As a peptide user,
I want to see my current progress toward weekly dose targets,
so that I can ensure I'm staying on track with my protocols.

#### Acceptance Criteria

1. Weekly progress dashboard showing current week's dose accumulation
2. Visual progress bars or charts for each active peptide protocol
3. Percentage completion and remaining doses for the week
4. Days remaining in current week with suggested dosing schedule
5. Color-coded status indicators (on track, behind, ahead, complete)
6. Quick access to log additional doses directly from progress view
7. Historical weekly performance trends showing consistency over time

### Story 3.3: Dose Alerts and Recommendations

As a peptide user,
I want to receive intelligent alerts about my dosing schedule,
so that I can avoid missed doses and stay within safe limits.

#### Acceptance Criteria

1. Alert system for approaching weekly dose limits (e.g., 90% of target reached)
2. Missed dose notifications based on expected protocol timing
3. Overdose prevention alerts when attempting to exceed safe limits
4. Injection site rotation reminders to prevent tissue damage
5. Protocol completion notifications when weekly targets are met
6. Customizable alert preferences and delivery methods
7. Smart recommendations for optimal timing of remaining doses

### Story 3.4: Protocol Analytics and Insights

As a peptide user,
I want to see analytics about my protocol adherence and patterns,
so that I can optimize my peptide use and identify trends.

#### Acceptance Criteria

1. Protocol adherence statistics showing consistency over time
2. Injection site rotation analysis to ensure proper practices
3. Timing pattern analysis identifying optimal injection windows
4. Dose variance tracking to maintain consistent levels
5. Weekly summary reports showing key metrics and achievements
6. Month-over-month comparison of protocol compliance
7. Exportable analytics reports for sharing with healthcare providers

## Epic 4: Data Export & Jay Campbell Content Integration

Complete the MVP by adding data export capabilities and integrating Jay Campbell's expert content, establishing credibility and providing user value beyond basic tracking while enabling users to maintain control of their data.

### Story 4.1: Comprehensive Data Export

As a peptide user,
I want to export my complete injection history and analytics,
so that I can backup my data and share it with healthcare providers.

#### Acceptance Criteria

1. Complete injection history export in CSV format with all tracked fields
2. PDF report generation with summary statistics and charts
3. Date range selection for targeted data exports
4. Peptide-specific export filtering for focused reports
5. Anonymous data export option removing personal identifiers
6. Automated monthly export option for regular backups
7. Data export includes protocol targets and adherence metrics

### Story 4.2: Jay Campbell Expert Content Integration

As a peptide user,
I want access to Jay Campbell's expert protocols and educational content within the app,
so that I can follow proven strategies and learn proper peptide use.

#### Acceptance Criteria

1. Expert content library featuring Jay Campbell's peptide protocols
2. Safety guidelines and best practices integrated into relevant app sections
3. Contextual content recommendations based on user's tracked peptides
4. Educational articles about injection techniques and site rotation
5. Protocol templates based on Jay Campbell's recommendations
6. Integration of expert content with tracking features (suggested targets, timing)
7. Regular content updates with new protocols and insights

### Story 4.3: Safety Features and Guidelines

As a peptide user,
I want built-in safety features and guidelines,
so that I can use peptides responsibly and avoid potential risks.

#### Acceptance Criteria

1. Safety validation preventing obviously dangerous dose amounts
2. Injection site rotation guidelines with visual anatomical guides
3. Drug interaction warnings for common peptide combinations
4. Protocol duration recommendations and cycling guidance
5. Emergency contact information and adverse reaction protocols
6. Integration with dose tracking to enforce safety limits
7. Disclaimer and legal compliance information prominently displayed

### Story 4.4: Performance Optimization and PWA Features

As a peptide user,
I want the app to work quickly and reliably, including offline capabilities,
so that I can log injections anytime without internet connectivity concerns.

#### Acceptance Criteria

1. Progressive Web App (PWA) installation capability for mobile devices
2. Offline injection logging with automatic sync when online
3. Service worker implementation for background data synchronization
4. App performance optimized for sub-2 second load times
5. Database queries optimized for large injection history datasets
6. Image and asset optimization for fast loading on mobile networks
7. Push notification capability for dose reminders and protocol alerts

## Development Progress

### Completed Deliverables ✅

| Deliverable | Status | Location | Date Completed |
|-------------|---------|----------|----------------|
| **UX Specification** | ✅ Complete | `docs/front-end-spec.md` | 2025-09-29 |
| **Technical Architecture** | ✅ Complete | `docs/architecture.md` | 2025-09-29 |
| **QA Risk Assessment** | ✅ Complete | QA Agent Analysis | 2025-09-29 |
| **Epic 1 Stories** | ✅ Complete | `docs/stories/1.*.md` | 2025-09-29 |

### Epic 1: Foundation & Core Infrastructure - **READY FOR DEVELOPMENT** 🚀

**Stories Created and Documented:**
- ✅ **Story 1.1:** [Project Setup and Development Environment](docs/stories/1.1.project-setup.md)
- ✅ **Story 1.2:** [User Authentication System](docs/stories/1.2.authentication-system.md)
- ✅ **Story 1.3:** [Database Schema and Core Models](docs/stories/1.3.database-schema.md)
- ✅ **Story 1.4:** [Basic Peptide Management](docs/stories/1.4.peptide-management.md)

**Epic 1 Overview:** [Epic 1 Foundation Document](docs/stories/epic-1-foundation.md)

**Development Readiness Status:**
- **Story Dependencies:** Fully mapped with critical path analysis
- **Infrastructure Sequence:** Detailed phase-by-phase setup guide
- **Acceptance Criteria:** Complete and testable for all stories
- **Technical Architecture:** Comprehensive implementation guidance

**Estimated Timeline:**
- **Sequential Development:** 12-16 days
- **Parallel Development (2 devs):** 8-10 days
- **Ready to Start:** Immediately

### Next Development Phases

**Epic 2: Injection Logging & History Management** (Next Priority)
- Requires Epic 1 foundation complete
- Stories to be created after Epic 1 implementation begins

**Epic 3: Weekly Dose Monitoring & Progress Tracking**
- Builds on injection data from Epic 2
- Stories to be created during Epic 2 development

**Epic 4: Data Export & Jay Campbell Content Integration**
- Completes MVP functionality
- Stories to be created during Epic 3 development

## PO Master Checklist Results

### Overall Assessment: **90% READY** ✅

| Category | Status | Score | Critical Issues |
|----------|---------|-------|-----------------|
| Project Setup & Initialization | ✅ PASS | 95% | 0 |
| Infrastructure & Deployment | ✅ PASS | 85% | 0 |
| External Dependencies | ⚠️ PARTIAL | 80% | Manual setup required |
| UI/UX Considerations | ✅ PASS | 90% | 0 |
| User/Agent Responsibility | ✅ PASS | 95% | 0 |
| Feature Sequencing | ✅ PASS | 95% | 0 |
| MVP Scope Alignment | ✅ PASS | 90% | 0 |
| Documentation & Handoff | ✅ PASS | 85% | 0 |

### Final Recommendation: **GO** - Development Ready ✅

**Remaining Manual Actions Required:**
- Create Clerk.com account and application
- Create Supabase project and configure database
- Set up Vercel account for deployment

**Development can begin immediately on Epic 1 stories.**