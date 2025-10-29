// Simple onboarding storage service for temporary data persistence
export interface OnboardingData {
    // Step 1: Required authentication fields
    email?: string;
    password?: string;
    confirmPassword?: string;

    // Step 2: Required profile fields
    username?: string;
    name?: string;

    // Step 3: Optional profile fields
    specialization?: string;
    year?: string;

    // Step 4: Optional personalization
    interests?: string[];
    avatar?: string; // base64 or URL
}

interface StoredOnboardingData {
    data: OnboardingData;
    currentStep: number;
    timestamp: number;
    expiresAt: number;
}

class OnboardingStorageService {
    private readonly STORAGE_KEY = 'saksham_onboarding_data';
    private readonly EXPIRY_MINUTES = 10;
    private cleanupTimer: NodeJS.Timeout | null = null;

    constructor() {
        this.setupAutoCleanup();
    }

    // Save data for current step
    saveStep(step: number, data: Partial<OnboardingData>): void {
        try {
            const existing = this.loadData();
            const mergedData = { ...existing?.data, ...data };

            const storageData: StoredOnboardingData = {
                data: mergedData,
                currentStep: step,
                timestamp: Date.now(),
                expiresAt: Date.now() + (this.EXPIRY_MINUTES * 60 * 1000)
            };

            // Simple base64 encoding for basic obfuscation
            const encoded = btoa(JSON.stringify(storageData));
            localStorage.setItem(this.STORAGE_KEY, encoded);

            // Reset cleanup timer
            this.resetCleanupTimer();
        } catch (error) {
            console.warn('Failed to save onboarding data:', error);
        }
    }

    // Load data for current step
    loadStep(step: number): Partial<OnboardingData> | null {
        const stored = this.loadData();
        if (!stored || stored.currentStep !== step) {
            return null;
        }
        return stored.data;
    }

    // Load all stored data
    loadData(): StoredOnboardingData | null {
        try {
            const encoded = localStorage.getItem(this.STORAGE_KEY);
            if (!encoded) return null;

            const decoded = JSON.parse(atob(encoded)) as StoredOnboardingData;

            // Check if expired
            if (Date.now() > decoded.expiresAt) {
                this.clearStorage();
                return null;
            }

            return decoded;
        } catch (error) {
            console.warn('Failed to load onboarding data:', error);
            this.clearStorage();
            return null;
        }
    }

    // Get current step
    getCurrentStep(): number {
        const stored = this.loadData();
        return stored?.currentStep || 1;
    }

    // Clear all storage
    clearStorage(): void {
        localStorage.removeItem(this.STORAGE_KEY);
        if (this.cleanupTimer) {
            clearTimeout(this.cleanupTimer);
            this.cleanupTimer = null;
        }
    }

    // Setup auto cleanup timer
    private setupAutoCleanup(): void {
        // Check for expired data on initialization
        const stored = this.loadData();
        if (stored && Date.now() > stored.expiresAt) {
            this.clearStorage();
            return;
        }

        // Set timer for remaining time
        if (stored) {
            const remainingTime = stored.expiresAt - Date.now();
            this.cleanupTimer = setTimeout(() => {
                this.clearStorage();
            }, remainingTime);
        }
    }

    // Reset cleanup timer (called when data is updated)
    private resetCleanupTimer(): void {
        if (this.cleanupTimer) {
            clearTimeout(this.cleanupTimer);
        }

        this.cleanupTimer = setTimeout(() => {
            this.clearStorage();
        }, this.EXPIRY_MINUTES * 60 * 1000);
    }

    // Check if has stored data
    hasStoredData(): boolean {
        return this.loadData() !== null;
    }

    // Get all stored data (for debugging)
    getAllData(): OnboardingData | null {
        const stored = this.loadData();
        return stored?.data || null;
    }
}

// Export singleton instance
export const onboardingStorage = new OnboardingStorageService();