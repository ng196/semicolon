# Design Document

## Overview

The user authentication and onboarding system will be built using existing CampusHub components and patterns. The design focuses on reusing stable UI components like dropdowns, form fields, and cards while maintaining consistency with the current application architecture. The system will be modular and removable without affecting existing functionality.

## Architecture

### Component Structure
```
src/
├── pages/
│   ├── auth
│   │  

### Route Integration
- New routes will be added to existing App.tsx without modifying current routes
- Protected route wrapper for authenticated-only pages
- Redirect logic for unauthenticated users

## Components and Interfaces

### Reused Components
- **Form Components:** Form, FormField, FormItem, FormLabel, FormControl, FormMessage
- **Input Components:** Input, Select, SelectContent, SelectItem, Checkbox, RadioGroup
- **UI Components:** Button, Card, Progress, Badge (for validation status)
- **Animation Components:** Framer Motion or CSS transitions for smooth step transitions
- **Layout Components:** Existing page layout patterns from Dashboard/Hubs

### New Components

#### AuthContext (Enhanced)
```typescript
interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  validateEmail: (email: string) => Promise<boolean>;
  validateUsername: (username: string) => Promise<boolean>;
}
```

#### OnboardingWizard Component
- Multi-step minimal animated but smooth wizard container
- Progress indicator with step validation
- Smooth transitions between steps
- Temporary storage management

#### OnboardingStorage Service
```typescript
interface OnboardingStorageService {
  saveStep: (step: number, data: Partial<OnboardingData>) => void;
  loadStep: (step: number) => Partial<OnboardingData> | null;
  clearStorage: () => void;
  setupAutoCleanup: () => void;
}
```

#### Wizard Step Components
- **Step1EmailPassword:** Email and password collection with real-time validation
- **Step2UserDetails:** Username and name collection with uniqueness checks
- **Step3ProfileInfo:** Optional specialization and year selection (dropdowns)
- **Step4Interests:** Interest selection and avatar setup

#### Real-time Validation Components
- **EmailValidator:** Async email format and uniqueness validation
- **UsernameValidator:** Async username format and uniqueness validation
- **ValidationIndicator:** Visual feedback for validation status

## Data Models

### User Model (based on schema)
```typescript
interface User {
  id: number;
  email: string;           // NOT NULL UNIQUE
  password_hash: string;   // NOT NULL (handled server-side)
  username: string;        // NOT NULL UNIQUE
  name: string;           // NOT NULL
  avatar?: string;        // NULLABLE
  specialization?: string; // NULLABLE
  year?: string;          // NULLABLE
  interests?: string;     // NULLABLE (JSON string)
  online_status: number;
  last_seen?: string;
  attendance_rate: number;
  created_at: string;
}
```

### Onboarding Wizard Data
```typescript
interface OnboardingData {
  // Step 1: Required authentication fields
  email: string;
  password: string;
  confirmPassword: string;
  
  // Step 2: Required profile fields
  username: string;
  name: string;
  
  // Step 3: Optional profile fields
  specialization?: string;
  year?: string;
  
  // Step 4: Optional personalization
  interests?: string[];
  avatar?: File;
}

interface WizardStep {
  stepNumber: number;
  title: string;
  description: string;
  fields: string[];
  isValid: boolean;
  isRequired: boolean;
}
```

### Validation Models
```typescript
interface ValidationResult {
  isValid: boolean;
  message?: string;
  isChecking?: boolean;
}

interface FieldValidation {
  email: ValidationResult;
  username: ValidationResult;
  password: ValidationResult;
  confirmPassword: ValidationResult;
  name: ValidationResult;
}
```

### Temporary Storage Model
```typescript
interface StoredOnboardingData {
  data: Partial<OnboardingData>;
  currentStep: number;
  timestamp: number;
  expiresAt: number;
}
```

## Error Handling

### Form Validation
- Use existing Zod validation patterns
- Reuse form error display components
- Real-time validation feedback

### API Error Handling
- Network error boundaries
- Retry mechanisms for failed requests
- User-friendly error messages
- Fallback UI states

### Error Boundary Integration
- Wrap auth components in error boundaries
- Graceful degradation for auth failures
- Error reporting and logging

## Testing Strategy

### Component Testing
- Unit tests for form validation
- Integration tests for auth flow
- Mock API responses for testing
- Error state testing

### User Flow Testing
- End-to-end registration flow
- Login/logout functionality
- Onboarding completion
- Route protection verification

### Accessibility Testing
- Form accessibility compliance
- Keyboard navigation support
- Screen reader compatibility
- Focus management during navigation

## Onboarding Wizard Flow

### Step Progression
```
Step 1: Email & Password
├── Email validation (format + uniqueness)
├── Password strength validation
├── Confirm password matching
└── Continue to Step 2

Step 2: Username & Name
├── Username validation (format + uniqueness)
├── Name validation (required field)
└── Continue to Step 3

Step 3: Profile Details (Optional)
├── Specialization dropdown selection
├── Year dropdown selection
└── Continue to Step 4

Step 4: Personalization (Optional)
├── Interest selection (checkboxes)
├── Avatar upload/selection
└── Complete Registration
```

### Temporary Storage Strategy
- **Storage Location:** localStorage with fallback to sessionStorage
- **Storage Key:** `campushub_onboarding_data`
- **Auto-cleanup:** 10-minute timer with activity reset
- **Data Encryption:** Base64 encoding for basic obfuscation
- **Cleanup Triggers:** Successful signup, manual clear, timeout

### Animation Strategy
- **Step Transitions:** Slide animations (left/right)
- **Validation Feedback:** Fade-in success/error states
- **Progress Indicator:** Smooth progress bar updates
- **Loading States:** Spinner for async validations

## Implementation Notes

### Data Requirements
**Predefined Options:**
1. **Specialization options:** Computer Science, Engineering, Business, Arts, Sciences, Medicine, Law, etc.
2. **Year options:** 1st Year, 2nd Year, 3rd Year, 4th Year, Graduate, PhD
3. **Interest categories:** Technology, Sports, Arts, Music, Gaming, Study Groups, etc.
4. **Default avatars:** Use existing avatar generation or provide preset options

### API Endpoints Required
```typescript
// New endpoints needed
get from backend , users email and username// Check username uniqueness
POST /api/auth/register         // Complete registration
```

### Integration Points
- Extend existing `/backend/src/controllers/users.ts`
- Add validation endpoints to user routes
- Integrate with existing JWT middleware
- Maintain compatibility with current user display components

### Security Considerations
- Rate limiting for validation endpoints (prevent enumeration)
- Secure temporary storage (avoid sensitive data persistence)
- Password strength requirements
- CSRF protection for all forms
- Input sanitization and validation