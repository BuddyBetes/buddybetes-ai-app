
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Initial application setup with Supabase authentication
- Sign-in and sign-up functionality
- User profile management
- Health data tracking capabilities
- Glucose logging system
- Assistant feature for user support
- Dashboard with glucose insights
- Food logging with meal context tracking
- Responsive design using Tailwind CSS
- Toast notifications for user feedback
- Mobile-friendly interfaces
- Date-grouped log display
- Delete log functionality with confirmation dialog
- Enhanced visual differentiation between food and glucose entries with distinctive icons and badges
- Improved log details display with better layout and visual hierarchy
- Move edit and delete actions to log detail view for cleaner list display
- Replace three-dot menu with chevron icon in log list for better navigation indication

### Authentication Improvements
- Enhanced password reset flow with more intuitive user experience
- Added show/hide password toggle for all password input fields across authentication forms
- Improved error handling and user feedback during authentication processes
- Implemented redirect to sign-in page after successful password reset
- Refined authentication state management in AuthContext
- Refactored authentication components for better maintainability and code organization
- Extracted password reset logic into dedicated context for improved state management

### Technical Features
- React with TypeScript implementation
- Supabase integration for backend services
- Authentication context for session management
- Form validation using React Hook Form
- Styled components using shadcn/ui
- Animation effects with Framer Motion
- Clean component architecture
- Robust error handling for date formatting and invalid data

### Changed
- Refined sign-in page component structure
- Extracted form logic into separate components for better code organization
- Improved error messaging during authentication
- Enhanced UI consistency across authentication flows
- Optimized authentication state detection and handling
- Refactored ResetPassword page into smaller, focused components
- Enhanced log detail view with better visual organization
- Improved UI differentiation between log entry types
- Updated dashboard to properly display glucose values in user's preferred unit (mg/dL or mmol/L)
- Redesigned log list with cleaner UI and right-arrow navigation indicator
- Moved log management actions to detail view for better user experience
- Simplified application header by removing text and keeping only the logo icon
- Improved date handling in logs display to prevent undefined or invalid dates

### Fixed
- Various UI/UX improvements
- Performance optimizations for mobile devices
- Improved alignment and styling of authentication forms
- Enhanced accessibility in authentication components
- Fixed date handling issues in log display components
- Resolved invalid prop warnings in React components
- Corrected empty dropdown values in health data edit forms
- Improved error handling for invalid date values
- Fixed glucose unit conversion in dashboard and charts when switching between mg/dL and mmol/L
- Fixed issue with undefined dates in message list

## [0.1.0] - Initial Release
- Core functionality established

