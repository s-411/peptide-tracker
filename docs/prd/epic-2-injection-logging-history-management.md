# Epic 2: Injection Logging & History Management

Implement the core injection logging functionality that represents the primary value proposition of the application. This epic delivers superior injection tracking capabilities with comprehensive history management, positioning the app as clearly better than spreadsheets or generic health apps for peptide users.

## Story 2.1: Quick Injection Logging Interface

As a peptide user,
I want to quickly log my injections with minimal clicks and typing,
so that I can maintain accurate records without disrupting my routine.

### Acceptance Criteria

1. Streamlined injection logging form accessible from dashboard and navigation
2. Peptide selection dropdown populated from user's peptide library
3. Dose amount input with validation against typical ranges for selected peptide
4. Date and time picker defaulting to current time with easy adjustment
5. Injection site selection from predefined body locations with visual guide
6. Optional notes field for tracking side effects, observations, or protocol changes
7. Form submission creates injection record and returns to appropriate view with success confirmation

## Story 2.2: Injection History Table and Filtering

As a peptide user,
I want to view and search through my complete injection history,
so that I can track patterns, verify doses, and maintain comprehensive records.

### Acceptance Criteria

1. Comprehensive injection history table showing date, peptide, dose, site, and notes
2. Sorting functionality for all major columns (date, peptide, dose)
3. Date range filtering to view specific time periods
4. Peptide filtering to focus on specific compounds
5. Injection site filtering to track rotation patterns
6. Text search across notes and peptide names
7. Pagination for large datasets with configurable page size
8. Mobile-responsive table design with horizontal scrolling or collapsed view

## Story 2.3: Injection Detail and Edit Capabilities

As a peptide user,
I want to view detailed information about specific injections and correct any logging mistakes,
so that I can maintain accurate records and fix data entry errors.

### Acceptance Criteria

1. Injection detail view showing complete information including timestamps
2. Edit injection functionality preserving data integrity and audit trail
3. Delete injection capability with confirmation dialog and soft delete option
4. Validation preventing future-dated injections or unrealistic dose amounts
5. Change tracking showing when injections were modified and by whom
6. Bulk selection and operations for managing multiple injections
7. Injection duplication feature for repeated protocols

## Story 2.4: Last 7 Days Summary View

As a peptide user,
I want to see a quick summary of my recent injection activity,
so that I can easily track my current weekly protocol compliance.

### Acceptance Criteria

1. Dashboard widget showing last 7 days of injection activity
2. Visual timeline or calendar view of recent injections
3. Quick stats showing total doses, unique peptides, and injection sites used
4. Identification of missed doses based on expected protocols
5. Direct links to edit or add injections for specific days
6. Visual indicators for protocol adherence and potential issues
7. Responsive design optimized for both mobile and desktop viewing
