# TODO List

## High Priority

### Security & Data

- [x] Implement proper error handling for API failures
- [x] Add encryption for stored API keys
- [x] Implement API key validation on save
- [x] Add logout functionality to clear stored credentials

### Testing & Code Quality

- [x] Add unit tests for BasecampService
  - [x] Test checkIn functionality
  - [x] Test validateCredentials
  - [x] Test error handling
- [x] Add unit tests for ZohoService
  - [x] Test checkIn functionality
  - [x] Test validateCredentials
  - [x] Test error handling
- [x] Add integration tests for API services
  - [x] Mock axios responses
  - [x] Test error scenarios
  - [x] Test retry logic
- [x] Add snapshot tests for UI components
- [x] Add missing UI component tests
  - [x] CheckInButton tests
  - [x] ThemedText tests
  - [x] ThemedView tests
  - [x] Header tests
  - [x] SettingsScreen tests
  - [x] SetupScreen tests
- [x] Add tests for hooks
  - [x] useThemeColor tests
  - [x] useColorScheme tests
- [ ] Set up test coverage reporting
- [ ] Add GitHub Actions for test automation

### Architecture Improvements

- [x] Implement dependency injection for services
- [x] Add service factory pattern
- [x] Create mock implementations for testing
- [x] Add proper error handling middleware
- [x] Implement retry logic for API calls
- [x] Add request/response interceptors
- [x] Create proper TypeScript DTOs for API responses

### UI/UX Improvements

- [ ] Add loading states and better error messages
- [ ] Implement proper dark mode theming
- [ ] Add pull-to-refresh for check-in status
- [ ] Add check-in history view

### Core Features

- [ ] Add offline mode support
- [ ] Implement background check-in reminders
- [ ] Add custom message templates for Basecamp
- [ ] Add support for multiple Basecamp projects
- [ ] Add check-in scheduling

### Additional Features

- [ ] Add support for multiple check-in locations
- [ ] Implement widgets for quick check-in

## Medium Priority

### App Enhancement

- [x] Add unit tests for core functionality
- [ ] Add E2E tests using Detox
- [x] Implement proper TypeScript strict mode
- [ ] Add proper logging system
- [ ] Add analytics for usage tracking

### UI Components

- [x] Create reusable form components
- [x] Add input validation messages
- [x] Implement proper form state management
- [ ] Add animations for state transitions
- [ ] Create skeleton loading screens

### Developer Experience

- [ ] Add proper documentation for API integration
- [ ] Create contribution guidelines
- [ ] Add GitHub Actions for CI/CD
- [ ] Implement proper error boundary handling

## Low Priority

### Optimization

- [ ] Optimize app bundle size
- [ ] Implement proper code splitting
- [ ] Add performance monitoring
- [ ] Optimize API calls
- [ ] Implement proper caching strategy

### Documentation

- [ ] Add API documentation
- [ ] Create user guide
- [ ] Add troubleshooting guide
- [ ] Create deployment guide
- [ ] Add architecture documentation

## Notes

- Keep tracking new feature requests from users
- Regular security audits needed
- Consider user feedback for priority adjustments
- Monitor API changes in Zoho and Basecamp
- Regular dependency updates needed
