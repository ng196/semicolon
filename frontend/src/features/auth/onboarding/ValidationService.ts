// Simple validation service for onboarding
export interface ValidationResult {
    isValid: boolean;
    message?: string;
    isChecking?: boolean;
}

class ValidationService {
    private readonly API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

    // Debounced email validation
    async validateEmail(email: string): Promise<ValidationResult> {
        // Basic format check first
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { isValid: false, message: 'Invalid email format' };
        }

        // Check if email is already registered
        try {
            const response = await fetch(`${this.API_BASE}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password: 'dummy',
                    username: 'dummy',
                    name: 'dummy'
                }),
            });

            if (response.status === 409) {
                return { isValid: false, message: 'Email already registered' };
            }

            // Any other error means we can't validate, so allow it
            return { isValid: true };
        } catch (error) {
            console.warn('Email validation failed:', error);
            return { isValid: true }; // Allow on network error
        }
    }

    // Debounced username validation
    async validateUsername(username: string): Promise<ValidationResult> {
        // Basic format check
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            return {
                isValid: false,
                message: 'Username must be 3-20 characters, letters, numbers, and underscores only'
            };
        }

        // For now, just validate format since backend requires auth to check users
        // TODO: Add proper username uniqueness check when auth endpoints are ready
        return { isValid: true };
    }

    // Password strength validation
    validatePassword(password: string): ValidationResult {
        if (password.length < 6) {
            return { isValid: false, message: 'Password must be at least 6 characters' };
        }

        if (password.length > 50) {
            return { isValid: false, message: 'Password must be less than 50 characters' };
        }

        return { isValid: true };
    }

    // Confirm password validation
    validateConfirmPassword(password: string, confirmPassword: string): ValidationResult {
        if (password !== confirmPassword) {
            return { isValid: false, message: 'Passwords do not match' };
        }
        return { isValid: true };
    }

    // Name validation
    validateName(name: string): ValidationResult {
        if (!name.trim()) {
            return { isValid: false, message: 'Name is required' };
        }

        if (name.trim().length < 2) {
            return { isValid: false, message: 'Name must be at least 2 characters' };
        }

        return { isValid: true };
    }

    // Debounced validation wrapper
    debounceValidation<T extends any[]>(
        key: string,
        validationFn: (...args: T) => Promise<ValidationResult>,
        delay: number = 500
    ): (...args: T) => Promise<ValidationResult> {
        return (...args: T) => {
            return new Promise((resolve) => {
                // Clear existing timer
                const existingTimer = this.debounceTimers.get(key);
                if (existingTimer) {
                    clearTimeout(existingTimer);
                }

                // Set new timer
                const timer = setTimeout(async () => {
                    const result = await validationFn(...args);
                    resolve(result);
                    this.debounceTimers.delete(key);
                }, delay);

                this.debounceTimers.set(key, timer);
            });
        };
    }

    // Get debounced validators
    getDebouncedEmailValidator() {
        return this.debounceValidation('email', this.validateEmail.bind(this));
    }

    getDebouncedUsernameValidator() {
        return this.debounceValidation('username', this.validateUsername.bind(this));
    }
}

// Export singleton instance
export const validationService = new ValidationService();