/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from '@/shared/hooks/use-toast';

// Types
export interface ApiRequestOptions extends RequestInit {
    requiresAuth?: boolean;
    retries?: number;
    timeout?: number;
    skipErrorToast?: boolean;
}

export interface ApiError extends Error {
    status?: number;
    code?: string;
    details?: any;
}

export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    status: number;
}

// Request/Response interceptor types
export type RequestInterceptor = (config: ApiRequestOptions & { url: string }) => Promise<ApiRequestOptions & { url: string }> | ApiRequestOptions & { url: string };
export type ResponseInterceptor = (response: Response) => Promise<Response> | Response;
export type ErrorInterceptor = (error: ApiError) => Promise<never> | never;

// Enhanced API Client
class EnhancedApiClient {
    private baseURL: string;
    private defaultRetries: number = 3;
    private defaultTimeout: number = 10000;
    private requestInterceptors: RequestInterceptor[] = [];
    private responseInterceptors: ResponseInterceptor[] = [];
    private errorInterceptors: ErrorInterceptor[] = [];

    constructor(baseURL: string) {
        this.baseURL = baseURL;
        this.setupDefaultInterceptors();
    }

    // Setup default interceptors
    private setupDefaultInterceptors() {
        // Default request interceptor - adds auth token
        this.addRequestInterceptor((config) => {
            const token = this.getAuthToken();
            if (token && config.requiresAuth !== false) {
                config.headers = {
                    ...config.headers,
                    Authorization: `Bearer ${token}`,
                };
            }
            return config;
        });

        // Default response interceptor - handles common responses
        this.addResponseInterceptor((response) => {
            // Log successful requests in development
            if (import.meta.env.DEV) {
                console.log(`✅ ${response.status} ${response.url}`);
            }
            return response;
        });

        // Default error interceptor - handles common errors
        this.addErrorInterceptor((error) => {
            // Handle authentication errors
            if (error.status === 401) {
                this.handleAuthError();
            }

            // Handle network errors
            if (!error.status) {
                error.message = 'Network error. Please check your connection.';
            }

            // Show toast notification for errors (unless skipped)
            if (!error.details?.skipErrorToast) {
                toast({
                    title: 'Error',
                    description: error.message,
                    variant: 'destructive',
                });
            }

            // Log errors in development
            if (import.meta.env.DEV) {
                console.error('❌ API Error:', error);
            }

            throw error;
        });
    }

    // Interceptor management
    addRequestInterceptor(interceptor: RequestInterceptor) {
        this.requestInterceptors.push(interceptor);
    }

    addResponseInterceptor(interceptor: ResponseInterceptor) {
        this.responseInterceptors.push(interceptor);
    }

    addErrorInterceptor(interceptor: ErrorInterceptor) {
        this.errorInterceptors.push(interceptor);
    }

    // Auth token management
    private getAuthToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    private handleAuthError() {
        // Clear invalid token
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');

        // Redirect to login if not already on auth page
        if (!window.location.pathname.startsWith('/auth/')) {
            window.location.href = '/auth/login';
        }
    }

    // Build headers
    private buildHeaders(options: ApiRequestOptions = {}): HeadersInit {
        return {
            'Content-Type': 'application/json',
            ...options.headers,
        };
    }

    // Enhanced response handler
    private async handleResponse(response: Response): Promise<any> {
        // Run response interceptors
        let processedResponse = response;
        for (const interceptor of this.responseInterceptors) {
            processedResponse = await interceptor(processedResponse);
        }

        // Handle non-ok responses
        if (!processedResponse.ok) {
            const error = await this.createApiError(processedResponse);

            // Run error interceptors
            for (const interceptor of this.errorInterceptors) {
                try {
                    await interceptor(error);
                } catch (interceptedError) {
                    throw interceptedError;
                }
            }

            throw error;
        }

        // Handle empty responses
        const contentType = processedResponse.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return null;
        }

        return processedResponse.json();
    }

    // Create structured API error
    private async createApiError(response: Response): Promise<ApiError> {
        let errorData: any = {};

        try {
            errorData = await response.json();
        } catch {
            // If response is not JSON, use status text
            errorData = { message: response.statusText };
        }

        const error = new Error(errorData.message || errorData.error || `HTTP ${response.status}`) as ApiError;
        error.status = response.status;
        error.code = errorData.code;
        error.details = errorData;

        return error;
    }

    // Request timeout handler
    private createTimeoutPromise(timeout: number): Promise<never> {
        return new Promise((_, reject) => {
            setTimeout(() => {
                const error = new Error('Request timeout') as ApiError;
                error.code = 'TIMEOUT';
                reject(error);
            }, timeout);
        });
    }

    // Main request method with enhanced features
    private async makeRequest(
        endpoint: string,
        options: ApiRequestOptions = {}
    ): Promise<any> {
        const {
            requiresAuth = true,
            retries = this.defaultRetries,
            timeout = this.defaultTimeout,
            skipErrorToast = false,
            ...fetchOptions
        } = options;

        let config = {
            url: `${this.baseURL}${endpoint}`,
            requiresAuth,
            skipErrorToast,
            ...fetchOptions,
            headers: this.buildHeaders(options),
        };

        // Run request interceptors
        for (const interceptor of this.requestInterceptors) {
            config = await interceptor(config);
        }

        let lastError: ApiError;

        // Retry logic
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const fetchPromise = fetch(config.url, {
                    ...config,
                    headers: config.headers,
                });

                const timeoutPromise = this.createTimeoutPromise(timeout);
                const response = await Promise.race([fetchPromise, timeoutPromise]);

                return await this.handleResponse(response as Response);
            } catch (error) {
                lastError = error as ApiError;
                lastError.details = { ...lastError.details, skipErrorToast };

                // Don't retry on authentication errors or client errors (4xx)
                if (lastError.status === 401 || (lastError.status && lastError.status >= 400 && lastError.status < 500)) {
                    break;
                }

                // Don't retry on last attempt
                if (attempt === retries) {
                    break;
                }

                // Exponential backoff: wait 1s, 2s, 4s...
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }

        throw lastError!;
    }

    // Public API methods
    async get<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
        return this.makeRequest(endpoint, { ...options, method: 'GET' });
    }

    async post<T = any>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<T> {
        return this.makeRequest(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T = any>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<T> {
        return this.makeRequest(endpoint, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async patch<T = any>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<T> {
        return this.makeRequest(endpoint, {
            ...options,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T = any>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<T> {
        return this.makeRequest(endpoint, {
            ...options,
            method: 'DELETE',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    // Utility methods
    setBaseURL(baseURL: string) {
        this.baseURL = baseURL;
    }

    setDefaultTimeout(timeout: number) {
        this.defaultTimeout = timeout;
    }

    setDefaultRetries(retries: number) {
        this.defaultRetries = retries;
    }

    // Health check
    async healthCheck(): Promise<boolean> {
        try {
            await this.get('/health', { requiresAuth: false, skipErrorToast: true });
            return true;
        } catch {
            return false;
        }
    }
}

// Create singleton instance
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const enhancedApiClient = new EnhancedApiClient(API_BASE_URL);

// Export for advanced usage
export { EnhancedApiClient };